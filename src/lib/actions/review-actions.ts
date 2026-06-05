"use server";

import { ReviewDecision } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { submitSubmissionReview } from "@/lib/services/review-service";

const reviewActionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required."),
  decision: z.nativeEnum(ReviewDecision),
  score: z.number().min(0).max(100),
  comments: z.string().trim().min(12).max(2000),
});

export async function submitReviewAction(input: unknown) {
  const session = await requireRole("FACULTY", "ADMIN");
  const parsed = reviewActionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review payload.",
    };
  }

  try {
    await submitSubmissionReview({
      viewer: {
        userId: session.user.id,
        role: session.user.role,
      },
      ...parsed.data,
    });

    revalidatePath("/faculty/review/review-queue");
    revalidatePath("/faculty/monitoring/project-health");
    revalidatePath("/faculty/dashboard");
    revalidatePath("/student/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SUBMISSION_NOT_FOUND") {
      return {
        success: false,
        message: "The selected submission is no longer available in your review scope.",
      };
    }

    return {
      success: false,
      message: "Unable to submit the review right now.",
    };
  }
}

const submissionActionSchema = z.object({
  type: z.nativeEnum(SubmissionType),
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  content: z.string().trim().min(10, "Content/evidence details must be at least 10 characters."),
});

import { SubmissionType } from "@prisma/client";
import { createStudentSubmission } from "@/lib/services/dashboard-service";
import { requirePageSession } from "@/lib/auth/session";

export async function createStudentSubmissionAction(input: unknown) {
  const session = await requirePageSession();
  if (session.user.role !== "STUDENT") {
    return {
      success: false,
      message: "Only students can submit project evidence.",
    };
  }

  const parsed = submissionActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid submission payload.",
    };
  }

  try {
    await createStudentSubmission({
      userId: session.user.id,
      ...parsed.data,
    });

    revalidatePath("/student/submissions");
    revalidatePath("/student/execution/weekly-submissions");
    revalidatePath("/student/dashboard");
    revalidatePath("/faculty/reviews");
    revalidatePath("/faculty/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_IN_TEAM") {
      return {
        success: false,
        message: "You must be assigned to a team/project before submitting evidence.",
      };
    }

    return {
      success: false,
      message: "Unable to submit evidence right now.",
    };
  }
}

const achievementActionSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  badge: z.string().trim().min(2, "Badge name must be at least 2 characters."),
  points: z.number().int().min(10).max(500),
});

export async function createAchievementAction(input: unknown) {
  const session = await requirePageSession();
  if (session.user.role !== "STUDENT") {
    return {
      success: false,
      message: "Only students can log achievements.",
    };
  }

  const parsed = achievementActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid achievement payload.",
    };
  }

  try {
    const { db } = await import("@/lib/db");
    await db.achievement.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    revalidatePath("/student/achievements");
    revalidatePath("/student/profile");
    revalidatePath("/student/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to save achievement right now.",
    };
  }
}

