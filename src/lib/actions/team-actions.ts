"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { DifficultyLevel } from "@prisma/client";
import { hash } from "bcryptjs";

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
      message: parsed.error.issues[0]?.message ?? "Invalid team creation payload.",
    };
  }

  const { name, studentNames } = parsed.data;
  const domain = "General"; // Default domain
  const batch = "2026-A"; // Default batch
  const difficulty = "BEGINNER"; // Default difficulty level
  const projectTitle = `${name} Project`;
  const projectDescription = `Research and development for ${domain} engineering applications.`;
  const facultyId = session.user.id;
  const facultyName = session.user.name || "Faculty Mentor";

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

      // 2. Create Team
      const team = await tx.team.create({
        data: {
          name,
          batch,
          projectTitle: project.title,
          facultyId,
          projectId: project.id,
        },
      });

      // 2b. Look up or create students by name and add memberships
      if (studentNames && studentNames.length > 0) {
        for (const rawName of studentNames) {
          const trimmedName = rawName.trim();
          if (!trimmedName) continue;

          // Look up existing student
          let studentUser = await tx.user.findFirst({
            where: {
              role: "STUDENT",
              name: {
                equals: trimmedName,
                mode: "insensitive",
              },
            },
          });

          // Create new student user if not found
          if (!studentUser) {
            const cleanName = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, ".");
            const defaultEmail = `${cleanName}@syntra.edu`;
            let finalEmail = defaultEmail;
            let emailCount = 1;

            // Make sure the email is unique
            while (true) {
              const existingEmail = await tx.user.findUnique({
                where: { email: finalEmail },
              });
              if (!existingEmail) break;
              finalEmail = `${cleanName}${emailCount}@syntra.edu`;
              emailCount++;
            }

            studentUser = await tx.user.create({
              data: {
                name: trimmedName,
                email: finalEmail,
                role: "STUDENT",
                passwordHash,
              },
            });
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

      // 4. Create an activity event
      await tx.activityEvent.create({
        data: {
          teamId: team.id,
          projectId: project.id,
          userId: facultyId,
          type: "milestone",
          title: "Team Created",
          detail: `${facultyName} created team "${name}" with project "${projectTitle}".`,
        },
      });

      return { team, project };
    });

    // Revalidate paths
    revalidatePath("/faculty");
    revalidatePath("/faculty/dashboard");
    revalidatePath("/faculty/management/teams-batches");
    revalidatePath("/faculty/teams");

    return {
      success: true,
      message: `Successfully created Team: "${result.team.name}"!`,
    };
  } catch (error) {
    console.error("Failed to create team:", error);
    return {
      success: false,
      message: "An error occurred while creating your team.",
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
