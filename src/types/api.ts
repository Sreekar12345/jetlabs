/**
 * API response wrapper types.
 * Every API route should return responses wrapped in these shapes
 * for consistent client-side handling.
 */

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination parameters sent from the client.
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Filter parameters for list endpoints.
 */
export type FilterParams = {
  search?: string;
  status?: string;
  role?: string;
  batch?: string;
  department?: string;
};
