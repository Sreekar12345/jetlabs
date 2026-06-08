// @ts-nocheck
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { toggleProblemBookmark } from "@/lib/services/problem-market-service";
import { db } from "@/lib/db";
import { generateUniqueTeamCode } from "@/lib/utils/code-generator";

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
  const session = await requireRole("STUDENT");
  const parsed = selectProjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid project selection payload.",
    };
  }

  const userId = session.user.id;
  const userName = session.user.name || "Student";
  const problemId = parsed.data.problemId;

  try {
    // 1. Check if user already has a team membership
    const existingMembership = await db.teamMember.findFirst({
      where: { userId },
    });
    if (existingMembership) {
      return {
        success: false,
        message: "You are already assigned to a project team.",
      };
    }

    // 2. Fetch problem details
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });
    if (!problem) {
      return {
        success: false,
        message: "Problem brief not found.",
      };
    }

    // 3. Find a faculty to assign as default mentor
    const faculty = await db.user.findFirst({
      where: { role: "FACULTY" },
    });
    if (!faculty) {
      return {
        success: false,
        message: "No faculty advisors found in the database. Please contact support.",
      };
    }

    // 4. Create Project, Team, and TeamMember in a transaction
    const result = await db.$transaction(async (tx: any) => {
      // Create Project
      const project = await tx.project.create({
        data: {
          title: problem.title,
          description: problem.summary,
          domain: problem.domain,
          difficulty: problem.difficulty,
          status: "DISCOVERY",
          progress: 0,
          riskScore: 0,
          healthStatus: "LOW",
          problemId: problem.id,
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
        },
      });

      // Create TeamMember
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId,
          roleLabel: "Lead",
          contributionScore: 100,
          lastActiveAt: new Date(),
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

      return { team, project };
    });

    revalidatePath("/student");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/problems");
    revalidatePath("/student/research/problem-market");

    return {
      success: true,
      message: `Successfully allocated Capstone Project: "${result.project.title}"!`,
    };
  } catch (error) {
    console.error("Failed to allocate project:", error);
    return {
      success: false,
      message: "An error occurred while setting up your project team.",
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
