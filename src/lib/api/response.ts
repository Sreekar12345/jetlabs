import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

type ApiErrorOptions = {
  code: string;
  message: string;
  status: number;
  details?: Record<string, string[]>;
};

type ApiSuccessOptions = {
  status?: number;
  meta?: ApiSuccessResponse<unknown>["meta"];
};

export function apiSuccess<T>(data: T, options?: ApiSuccessOptions) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.meta ? { meta: options.meta } : {}),
  };

  return NextResponse.json(response, {
    status: options?.status ?? 200,
  });
}

export function apiError({
  code,
  message,
  status,
  details,
}: ApiErrorOptions) {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  return NextResponse.json(response, { status });
}
