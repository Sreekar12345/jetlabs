/**
 * Zod validation schemas for submissions and reviews.
 */
import { z } from "zod";

export const submissionSchema = z.object({
  week: z.number().int().min(1).max(16),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(2000),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  deployUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  attachments: z.array(z.string()).default([]),
});

export const reviewSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(5000),
  score: z.number().min(0).max(10).optional(),
  status: z.enum(["approved", "rejected", "revision"]),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
