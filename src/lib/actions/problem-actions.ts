// @ts-nocheck
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { toggleProblemBookmark } from "@/lib/services/problem-market-service";
import { db } from "@/lib/db";
import { generateUniqueTeamCode } from "@/lib/utils/code-generator";
import { initializeProjectWeeklyMilestones } from "@/lib/services/milestone-service";

const toggleBookmarkSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required."),
});

export async function toggleProblemBookmarkAction(input: unknown) {
  const session = await requireRole("STUDENT", "FACULTY", "ADMIN");
  const parsed = toggleBookmarkSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid bookmark payload.",
    };
  }

  try {
    const result = await toggleProblemBookmark(
      {
        userId: session.user.id,
        role: session.user.role,
      },
      parsed.data.problemId,
    );

    revalidatePath("/student/research/problem-market");
    revalidatePath("/student/dashboard");

    return {
      success: true,
      bookmarked: result.bookmarked,
    };
  } catch {
    return {
      success: false,
      message: "Unable to update bookmarks right now.",
    };
  }
}

const selectProjectSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required."),
});

export async function selectProblemAsProjectAction(input: unknown) {
  // Validate authorization
  let session;
  try {
    session = await requireRole("STUDENT");
  } catch (authError) {
    console.error("[DEBUG LOG] Authorization failed: User is not a STUDENT.");
    return {
      success: false,
      message: "Only team leader can assign project",
      status: 403,
    };
  }

  const parsed = selectProjectSchema.safeParse(input);
  console.log("[DEBUG LOG] API Payload:", JSON.stringify(input));
  console.log("[DEBUG LOG] Validation Result:", parsed.success ? "SUCCESS" : "FAILED", parsed.success ? "" : parsed.error.issues);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid project selection payload.",
    };
  }

  const userId = session.user.id;
  const userName = session.user.name || "Student";
  const problemId = parsed.data.problemId;

  console.log("[DEBUG LOG] Current User ID:", userId);
  console.log("[DEBUG LOG] Selected Problem ID:", problemId);

  try {
    // 1. Check if user already has a team membership
    const existingMembership = await db.teamMember.findFirst({
      where: { userId },
    });
    
    console.log("[DEBUG LOG] Database Query Result (Membership):", existingMembership);
    if (existingMembership) {
      console.log("[DEBUG LOG] Current Team ID:", existingMembership.teamId);
      console.log("[DEBUG LOG] Current Team Role:", existingMembership.role);
    } else {
      console.log("[DEBUG LOG] No active team membership found.");
    }

    // 2. Fetch problem details
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });
    console.log("[DEBUG LOG] Database Query Result (Problem):", problem);

    if (!problem) {
      return {
        success: false,
        message: "Problem statement not found",
      };
    }

    // Authorization verification
    if (existingMembership) {
      if (existingMembership.role !== "TEAM_LEAD") {
        return {
          success: false,
          message: "Only team leader can assign project",
          status: 403,
        };
      }
    }

    if (existingMembership) {
      // Fetch team details
      const team = await db.team.findUnique({
        where: { id: existingMembership.teamId },
      });
      console.log("[DEBUG LOG] Database Query Result (Team):", team);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
        };
      }

      if (team.status !== "ACTIVE") {
        return {
          success: false,
          message: "Team is not active",
        };
      }

      // Check if problem statement is already assigned to a different team
      if (problem.isAssigned && team.selectedProblemStatementId !== problem.id) {
        return {
          success: false,
          message: "Project already assigned",
        };
      }

      // Update existing team project
      const transactionResult = await db.$transaction(async (tx: any) => {
        // Release old problem statement if any
        if (team.selectedProblemStatementId && team.selectedProblemStatementId !== problem.id) {
          await tx.problem.update({
            where: { id: team.selectedProblemStatementId },
            data: { isAssigned: false },
          });
        }

        const projectUpdate = await tx.project.update({
          where: { id: team.projectId },
          data: {
            title: problem.title,
            description: problem.description || problem.summary,
            domain: problem.domain,
            difficulty: problem.difficulty,
            problemId: problem.id,
            managementStatus: "CREATED",
            progressPercentage: 0,
            projectFacultyId: team.facultyId,
          },
        });

        const teamUpdate = await tx.team.update({
          where: { id: team.id },
          data: {
            projectTitle: problem.title,
            selectedProblemStatementId: problem.id,
          },
        });

        const problemUpdate = await tx.problem.update({
          where: { id: problem.id },
          data: { isAssigned: true },
        });

        // Regenerate milestones and automated weekly tasks
        await tx.weeklyMilestone.deleteMany({
          where: { projectId: team.projectId },
        });
        await initializeProjectWeeklyMilestones(team.projectId, tx, new Date());

        return { projectUpdate, teamUpdate, problemUpdate };
      }, {
        timeout: 30000, // Fixed 30s timeout to support Neon Serverless Postgres latency
      });

      console.log("[DEBUG LOG] Transaction Result:", JSON.stringify(transactionResult));

      try {
        const { logSystemEvent } = await import("@/lib/services/audit-service");
        await logSystemEvent({
          userId: session.user.id,
          userRole: session.user.role,
          actionType: "PROBLEM_STATEMENT_SELECTED",
          eventCategory: "PROJECT",
          entityType: "Project",
          entityId: team.projectId,
          actionPerformed: `Team lead "${userName}" selected Problem Statement "${problem.title}" for team "${team.name}".`,
          metadata: {
            problemId: problem.id,
            teamId: team.id,
          },
        });
        await logSystemEvent({
          userId: session.user.id,
          userRole: session.user.role,
          actionType: "ROADMAP_GENERATED",
          eventCategory: "PROJECT",
          entityType: "Project",
          entityId: team.projectId,
          actionPerformed: `Roadmap and weekly milestones regenerated for project "${problem.title}".`,
        });
      } catch (auditError) {
        console.error("Failed to log problem statement selection audit:", auditError);
      }

      return {
        success: true,
        message: `Successfully updated your team's project to "${problem.title}".`,
      };
    }

    // 3. Find a faculty to assign as default mentor (onboarding flow)
    const faculty = await db.user.findFirst({
      where: { role: "FACULTY" },
    });
    if (!faculty) {
      return {
        success: false,
        message: "No faculty advisors found in the database. Please contact support.",
      };
    }

    // Check if problem statement is already assigned
    if (problem.isAssigned) {
      return {
        success: false,
        message: "Project already assigned",
      };
    }

    // 4. Create Project, Team, and TeamMember in a transaction
    const result = await db.$transaction(async (tx: any) => {
      // 4a. Verify that the student user actually exists in the database to prevent fkey violations
      const studentUser = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!studentUser) {
        throw new Error("Student account not found in database. Please log out and sign back in.");
      }

      // 4b. Verify that the faculty advisor actually exists in the database
      const facultyUser = await tx.user.findUnique({
        where: { id: faculty.id },
      });
      if (!facultyUser) {
        throw new Error("Assigned faculty advisor not found in database. Please contact support.");
      }

      // Create Project
      const project = await tx.project.create({
        data: {
          title: problem.title,
          description: problem.description || problem.summary,
          domain: problem.domain,
          difficulty: problem.difficulty,
          status: "DISCOVERY",
          progress: 0,
          riskScore: 0,
          healthStatus: "LOW",
          problemId: problem.id,
          managementStatus: "CREATED",
          progressPercentage: 0,
          projectFacultyId: faculty.id,
        },
      });

      // Generate a unique team code
      const teamCode = await generateUniqueTeamCode(tx);

      // Create Team
      const team = await tx.team.create({
        data: {
          name: `Team ${userName.split(" ")[0]}`,
          batch: "2026 CSE-A",
          projectTitle: project.title,
          facultyId: faculty.id,
          projectId: project.id,
          teamCode: teamCode,
          selectedProblemStatementId: problem.id,
        },
      });

      // Mark selected Problem as assigned
      await tx.problem.update({
        where: { id: problem.id },
        data: { isAssigned: true },
      });

      // Create TeamMember
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId,
          roleLabel: "Lead",
          role: "TEAM_LEAD",
          contributionScore: 100,
          lastActiveAt: new Date(),
        },
      });

      // Synchronize the student's User record direct fields to match the team assignment and prevent data drift
      await tx.user.update({
        where: { id: userId },
        data: {
          teamId: team.id,
          facultyId: faculty.id,
          mentorId: faculty.id,
          joinedTeamAt: new Date(),
        },
      });

      // Initialize standard Milestones
      await tx.projectMilestone.createMany({
        data: [
          {
            projectId: project.id,
            title: "Problem framing locked",
            description: `Lock down research goals and telemetry scope for "${problem.title}" in the ${problem.domain} domain.`,
            stage: "Research",
            status: "IN_PROGRESS",
            position: 1,
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Literature evidence mapping",
            description: `Audit prior work on ${problem.summary.toLowerCase()} and establish baselines.`,
            stage: "Research",
            status: "PENDING",
            position: 2,
            dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: `${problem.category} MVP development`,
            description: `Construct the core prototype slice solving key ${problem.domain} engineering bottlenecks.`,
            stage: "Execution",
            status: "PENDING",
            position: 3,
            dueAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Model/Algorithm Evaluation",
            description: `Assess accuracy, latency, and benchmarks for your dynamic "${problem.title}" models.`,
            stage: "Execution",
            status: "PENDING",
            position: 4,
            dueAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "IEEE paper drafting",
            description: `Complete methodology, results, and write abstract detailing your ${problem.domain} solutions.`,
            stage: "Publication",
            status: "PENDING",
            position: 5,
            dueAt: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Viva preparation rehearsing",
            description: `Rehearse defense questions for your "${problem.title}" capstone project before final evaluation.`,
            stage: "Evaluation",
            status: "PENDING",
            position: 6,
            dueAt: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // Create an activity event
      await tx.activityEvent.create({
        data: {
          teamId: team.id,
          projectId: project.id,
          userId,
          type: "milestone",
          title: "Project selected",
          detail: `${userName} selected problem brief "${problem.title}" as their Capstone project.`,
        },
      });

      // 4b. Trigger notifications for Project Created and Problem Statement Selected
      await tx.notification.create({
        data: {
          userId,
          userRole: "STUDENT",
          title: "Project Created",
          message: `Your project "${project.title}" has been successfully created.`,
          type: "PROJECT_CREATED",
          relatedEntityId: project.id,
          triggerEvent: "PROJECT_CREATED",
        },
      });

      await tx.notification.create({
        data: {
          userId,
          userRole: "STUDENT",
          title: "Problem Statement Selected",
          message: `You have selected the problem statement: "${problem.title}".`,
          type: "PROBLEM_STATEMENT_SELECTED",
          relatedEntityId: problem.id,
          triggerEvent: "PROBLEM_STATEMENT_SELECTED",
        },
      });

      await tx.notification.create({
        data: {
          userId: faculty.id,
          userRole: "FACULTY",
          title: "Project Created",
          message: `A new project "${project.title}" has been created for your guided team.`,
          type: "PROJECT_CREATED",
          relatedEntityId: project.id,
          triggerEvent: "PROJECT_CREATED",
        },
      });

      await tx.notification.create({
        data: {
          userId: faculty.id,
          userRole: "FACULTY",
          title: "Problem Statement Selected",
          message: `Team "${team.name}" has selected the problem statement: "${problem.title}".`,
          type: "PROBLEM_STATEMENT_SELECTED",
          relatedEntityId: problem.id,
          triggerEvent: "PROBLEM_STATEMENT_SELECTED",
        },
      });

      // Initialize weekly milestones and automated tasks now that the team lead membership exists
      await initializeProjectWeeklyMilestones(project.id, tx, project.createdAt);

      return { team, project };
    }, {
      timeout: 30000, // Fixed 30s timeout to support Neon Serverless Postgres latency
    });

    console.log("[DEBUG LOG] Onboarding Transaction Result:", JSON.stringify(result));

    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      await logSystemEvent({
        userId,
        userRole: "STUDENT",
        actionType: "PROJECT_CREATED",
        eventCategory: "PROJECT",
        entityType: "Project",
        entityId: result.project.id,
        actionPerformed: `Student "${userName}" created project "${result.project.title}" for team "${result.team.name}".`,
        newState: JSON.stringify({
          id: result.project.id,
          title: result.project.title,
          teamId: result.team.id,
        }),
      });

      await logSystemEvent({
        userId,
        userRole: "STUDENT",
        actionType: "PROBLEM_STATEMENT_SELECTED",
        eventCategory: "PROJECT",
        entityType: "Project",
        entityId: result.project.id,
        actionPerformed: `Student "${userName}" selected Problem Statement "${problem.title}" for project "${result.project.title}".`,
        metadata: {
          problemId: problem.id,
        },
      });

      await logSystemEvent({
        userId,
        userRole: "STUDENT",
        actionType: "ROADMAP_GENERATED",
        eventCategory: "PROJECT",
        entityType: "Project",
        entityId: result.project.id,
        actionPerformed: `Roadmap and weekly milestones initialized for project "${result.project.title}".`,
      });
    } catch (auditError) {
      console.error("Failed to log project allocation audits:", auditError);
    }

    revalidatePath("/student");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/problems");
    revalidatePath("/student/research/problem-market");

    return {
      success: true,
      message: `Successfully allocated Capstone Project: "${result.project.title}"!`,
    };
  } catch (error: any) {
    console.error("[DEBUG LOG] Exception caught:", error);
    if (error.stack) {
      console.error(error.stack);
    }
    
    // Determine the actionable error message
    let errorMessage = "An error occurred while setting up your project team.";
    if (error instanceof Error) {
      if (error.message.includes("Expired transaction") || error.message.includes("expired transaction") || error.message.includes("timeout")) {
        errorMessage = "Database constraint violation: Interactive transaction timed out. Please try again.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function discontinueCapstoneProjectAction() {
  const session = await requireRole("STUDENT");
  const userId = session.user.id;

  try {
    const membership = await db.teamMember.findFirst({
      where: { userId },
    });

    if (!membership) {
      return {
        success: false,
        message: "You do not have an active capstone project team.",
      };
    }

    const teamId = membership.teamId;

    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return {
        success: false,
        message: "Your project team record could not be found.",
      };
    }

    const projectId = team.projectId;

    const submissions = await db.submission.findMany({
      where: { teamId },
      select: { id: true },
    });

    const submissionIds = submissions.map((sub) => sub.id);

    if (submissionIds.length > 0) {
      await db.review.deleteMany({
        where: { submissionId: { in: submissionIds } },
      });
    }

    await db.submission.deleteMany({
      where: { teamId },
    });

    await db.teamMember.deleteMany({
      where: { teamId },
    });

    await db.activityEvent.deleteMany({
      where: {
        OR: [
          { teamId },
          { projectId },
        ],
      },
    });

    // Release problem statement if any
    const currentProblemId = team.selectedProblemStatementId;
    if (currentProblemId) {
      await db.problem.update({
        where: { id: currentProblemId },
        data: { isAssigned: false },
      });
    }

    await db.team.delete({
      where: { id: teamId },
    });

    await db.projectMilestone.deleteMany({
      where: { projectId },
    });

    await db.analyticsSnapshot.deleteMany({
      where: { projectId },
    });

    await db.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/student");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/problems");
    revalidatePath("/student/research/problem-market");
    revalidatePath("/student/profile");

    return {
      success: true,
      message: "Capstone project successfully discontinued and reset.",
    };
  } catch (error) {
    console.error("Failed to discontinue project:", error);
    return {
      success: false,
      message: "An error occurred while discontinuing your project.",
    };
  }
}
