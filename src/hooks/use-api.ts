/**
 * Custom hook for API data fetching with TanStack Query.
 *
 * Provides typed, cached data fetching for dashboard pages.
 * These hooks consume the live dashboard API routes.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  Batch,
  BatchAnalytics,
  Milestone,
  Student,
} from "@/types";

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  let json: ApiResponse<T> | null = null;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (json && !json.success) {
      throw new ApiClientError(
        json.error.message,
        response.status,
        json.error.code,
        json.error.details,
      );
    }

    if (response.status === 401) {
      throw new ApiClientError(
        "Your session has expired. Please sign in again.",
        401,
        "UNAUTHORIZED",
      );
    }

    if (response.status === 403) {
      throw new ApiClientError(
        "You do not have access to this resource.",
        403,
        "FORBIDDEN",
      );
    }

    if (response.status >= 500) {
      throw new ApiClientError(
        "The server encountered an error. Please try again.",
        response.status,
        "SERVER_ERROR",
      );
    }

    throw new ApiClientError(
      `Request failed with status ${response.status}.`,
      response.status,
      "REQUEST_FAILED",
    );
  }

  if (!json || !json.success) {
    throw new ApiClientError(
      "The server returned an unexpected response.",
      500,
      "INVALID_RESPONSE",
    );
  }

  return json.data;
}

export function useStudents(params?: {
  search?: string;
  batch?: string;
  department?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.batch) searchParams.set("batch", params.batch);
  if (params?.department) searchParams.set("department", params.department);
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["students", params],
    queryFn: () => fetchApi<Student[]>(`/api/students${qs ? `?${qs}` : ""}`),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchApi<BatchAnalytics[]>("/api/analytics"),
  });
}

export function useRoadmap() {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: () => fetchApi<Milestone[]>("/api/roadmap"),
  });
}

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: () => fetchApi<Batch[]>("/api/faculty"),
  });
}
