// ─────────────────────────────────────────────────────────────
// Standardized API Response Types
// ─────────────────────────────────────────────────────────────

/**
 * Pagination metadata included in paginated responses.
 */
export type PaginationMeta = {
  page: number;
  total_pages: number;
  limit: number;
  total: number;
};

/**
 * Success response without pagination.
 *
 * @example
 * { "data": { "id": 1, "name": "Budget A" } }
 */
export type SuccessResponse<T> = {
  data: T;
};

/**
 * Success response with pagination metadata.
 *
 * @example
 * {
 *   "data": [{ "id": 1 }, { "id": 2 }],
 *   "meta": { "page": 1, "total_pages": 5, "limit": 10, "total": 50 }
 * }
 */
export type PaginatedResponse<T> = {
  data: T;
  meta: PaginationMeta;
};

/**
 * Error response returned when something goes wrong.
 *
 * @example
 * { "error_message": "Unauthorized" }
 */
export type ErrorResponse = {
  error_message: string;
};

/**
 * Union of all possible API response shapes.
 * Useful for typing the return value of fetchers on the client side.
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Union of all possible paginated API response shapes.
 */
export type PaginatedApiResponse<T> = PaginatedResponse<T> | ErrorResponse;

// ─────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────

/**
 * Check if a response is an error response.
 */
export function isErrorResponse<T>(
  response: ApiResponse<T> | PaginatedApiResponse<T>,
): response is ErrorResponse {
  return 'error_message' in response;
}

/**
 * Check if a response is a paginated success response.
 */
export function isPaginatedResponse<T>(
  response: ApiResponse<T> | PaginatedApiResponse<T>,
): response is PaginatedResponse<T> {
  return 'meta' in response && 'data' in response;
}

/**
 * Check if a response is a (non-paginated) success response.
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | PaginatedApiResponse<T>,
): response is SuccessResponse<T> {
  return 'data' in response && !('meta' in response);
}
