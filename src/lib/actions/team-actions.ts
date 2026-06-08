"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { DifficultyLevel } from "@prisma/client";
import { hash } from "bcryptjs";

import { generateUniqueTeamCode } from "@/lib/utils/code-generator";

const createTeamSchema = z.object({
  name: z.string().trim().min(3, "Team name must be at least 3 characters."),
  studentNames: z.array(z.string()).optional(),
});

export async function createTeamAction(input: unknown) {
  const session = await requireRole("FACULTY", "ADMIN");
  const parsed = createTeamSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid team creation payload.",
      message: parsed.error.issues[0]?.message ?? "Invalid team creation payload.",
    };
  }

  const { name, studentNames } = parsed.data;
  const teamName = name;
  const domain = "General"; // Default domain
  const batch = "2026-A"; // Default batch
  const difficulty = "BEGINNER"; // Default difficulty level
  const projectTitle = `${teamName} Project`;
  const projectDescription = `Research and development for ${domain} engineering applications.`;
  const facultyId = session.user.id;
  const facultyName = session.user.name || "Faculty Mentor";

  console.log("Starting team creation");
  console.log("Faculty ID:", facultyId);
  console.log("Team Name:", teamName);
  console.log("Student Names:", studentNames);

  // Verify that the faculty user exists in the database to prevent fkey violations (e.g., from stale cookies after reset)
  const facultyUser = await db.user.findUnique({
    where: { id: facultyId },
  });

  if (!facultyUser) {
    return {
      success: false,
      error: "Your faculty account was not found in the database. Please log out and sign back in.",
      message: "Your faculty account was not found in the database. Please log out and sign back in.",
    };
  }

  try {
    const passwordHash = await hash("Syntra123", 12);
    const result = await db.$transaction(async (tx) => {
      // 1. Create Project
      const project = await tx.project.create({
        data: {
          title: projectTitle,
          description: projectDescription,
          domain: domain,
          difficulty: difficulty,
          status: "DISCOVERY",
          progress: 0,
          riskScore: 0,
          healthStatus: "LOW",
        },
      });

      // Generate a unique team code
      const teamCode = await generateUniqueTeamCode(tx);
      console.log("Generated Team Code:", teamCode);
      console.log("Saving Team:", teamName);

      // 2. Create Team
      const team = await tx.team.create({
        data: {
          name: teamName,
          batch,
          projectTitle: project.title,
          facultyId,
          projectId: project.id,
          teamCode: teamCode,
        },
      });

      console.log("Team Created:", team.id);

      // 2b. Look up existing students and add memberships (throw error if not found)
      if (studentNames && studentNames.length > 0) {
        for (const rawName of studentNames) {
          const trimmedName = rawName.trim();
          if (!trimmedName) continue;

          // Look up existing student
          const studentUser = await tx.user.findFirst({
            where: {
              role: "STUDENT",
              name: {
                equals: trimmedName,
                mode: "insensitive",
              },
            },
          });

          // Throw error if student does not exist
          if (!studentUser) {
            throw new Error(`Student "${trimmedName}" not found.`);
          }

          // Create membership
          await tx.teamMember.create({
            data: {
              teamId: team.id,
              userId: studentUser.id,
              roleLabel: "Member",
            },
          });
        }
      }

      console.log("Team Members Added");

      // 3. Initialize standard Milestones
      await tx.projectMilestone.createMany({
        data: [
          {
            projectId: project.id,
            title: "Problem framing locked",
            description: `Lock down research goals and telemetry scope for "${projectTitle}" in the ${domain} domain.`,
            stage: "Research",
            status: "IN_PROGRESS",
            position: 1,
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Literature evidence mapping",
            description: `Audit prior work on ${projectDescription.toLowerCase()} and establish baselines.`,
            stage: "Research",
            status: "PENDING",
            position: 2,
            dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "MVP development",
            description: `Construct the core prototype slice solving key ${domain} engineering bottlenecks.`,
            stage: "Execution",
            status: "PENDING",
            position: 3,
            dueAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Model/Algorithm Evaluation",
            description: `Assess accuracy, latency, and benchmarks for your dynamic "${projectTitle}" models.`,
            stage: "Execution",
            status: "PENDING",
            position: 4,
            dueAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "IEEE paper drafting",
            description: `Complete methodology, results, and write abstract detailing your ${domain} solutions.`,
            stage: "Publication",
            status: "PENDING",
            position: 5,
            dueAt: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
          },
          {
            projectId: project.id,
            title: "Viva preparation rehearsing",
            description: `Rehearse defense questions for your "${projectTitle}" capstone project before final evaluation.`,
            stage: "Evaluation",
            status: "PENDING",
            position: 6,
            dueAt: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      console.log("Default Milestones Created");

      // 4. Create an activity event
      await tx.activityEvent.create({
        data: {
          teamId: team.id,
          projectId: project.id,
          userId: facultyId,
          type: "milestone",
          title: "Team Created",
          detail: `${facultyName} created team "${teamName}" with project "${projectTitle}".`,
        },
      });

      return { team, project };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    // Revalidate paths
    revalidatePath("/faculty");
    revalidatePath("/faculty/dashboard");
    revalidatePath("/faculty/management/teams-batches");
    revalidatePath("/faculty/teams");

    const teamWithCode = {
      ...result.team,
      team_code: result.team.teamCode,
    };

    return {
      success: true,
      message: `Successfully created Team: "${result.team.name}"!`,
      team: teamWithCode,
      teamCode: result.team.teamCode,
    };
  } catch (error) {
    console.error("TEAM CREATION ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown team creation error",
      message: error instanceof Error ? error.message : "Unknown team creation error",
    };
  }
}

export async function getStudentsAction() {
  await requireRole("FACULTY", "ADMIN");
  try {
    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, students };
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return { success: false, students: [] };
  }
}
