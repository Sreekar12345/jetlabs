import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createUserAccount } from "@/lib/services/user-service";
import type { RegisterResponse } from "@/types";
import { registerSchema } from "@/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.flatten().fieldErrors;

      return apiError({
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields and try again.",
        status: 422,
        details: Object.fromEntries(
          Object.entries(details).filter(([, value]) => Boolean(value && value.length)),
        ),
      });
    }

    const user = await createUserAccount(validation.data);

    const response = apiSuccess<RegisterResponse>(
      {
        user,
      },
      {
        status: 201,
      },
    );

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError({
        code: "INVALID_REQUEST_BODY",
        message: "Send a valid JSON payload.",
        status: 400,
      });
    }

    if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
      return apiError({
        code: "ROLE_NOT_ALLOWED",
        message:
          "Self-service registration is only available for student accounts.",
        status: 403,
      });
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return apiError({
        code: "EMAIL_ALREADY_EXISTS",
        message: "An account with that email address already exists.",
        status: 409,
        details: {
          email: ["An account with that email address already exists."],
        },
      });
    }

    console.error("Registration failed", error);

    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to create your account right now.",
      status: 500,
    });
  }
}
