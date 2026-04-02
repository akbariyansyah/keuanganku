import { NextResponse } from 'next/server';
import type {
  SuccessResponse,
  PaginatedResponse,
  ErrorResponse,
  PaginationMeta,
} from '@/types/api/api-response';

// ─────────────────────────────────────────────────────────────
// Pagination Helpers
// ─────────────────────────────────────────────────────────────

type PaginationInput = {
  page: number;
  limit: number;
  total: number;
};

/**
 * Build a `PaginationMeta` object from raw pagination values.
 *
 * @example
 * const meta = createPaginationMeta({ page: 1, limit: 10, total: 95 });
 * // { page: 1, total_pages: 10, limit: 10, total: 95 }
 */
export function createPaginationMeta(input: PaginationInput): PaginationMeta {
  return {
    page: input.page,
    total_pages: Math.ceil(input.total / input.limit),
    limit: input.limit,
    total: input.total,
  };
}

// ─────────────────────────────────────────────────────────────
// Response Builders (plain objects)
// ─────────────────────────────────────────────────────────────

/**
 * Build a success response body (without pagination).
 */
export function successBody<T>(data: T): SuccessResponse<T> {
  return { data };
}

/**
 * Build a paginated success response body.
 */
export function paginatedBody<T>(
  data: T,
  pagination: PaginationInput,
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(pagination),
  };
}

/**
 * Build an error response body.
 */
export function errorBody(message: string): ErrorResponse {
  return { error_message: message };
}

// ─────────────────────────────────────────────────────────────
// NextResponse Wrappers
// ─────────────────────────────────────────────────────────────

/**
 * Return a `NextResponse` containing a **success** payload.
 *
 * @param data    The response data (any type).
 * @param message Optional human-readable message (e.g., "User created successfully").
 * @param status  HTTP status code (default `200`).
 *
 * @example
 * return sendSuccess(user, 201);
 */
export function sendSuccess<T>(data: T, message?: string, status: number = 200) {
  const body = message ? { ...successBody(data), message } : successBody(data);
  return NextResponse.json(body, { status });
}

/**
 * Return a `NextResponse` containing a **paginated success** payload.
 *
 * @param data       The array (or any shape) of results.
 * @param pagination Raw pagination numbers (`page`, `limit`, `total`).
 * @param status     HTTP status code (default `200`).
 *
 * @example
 * return sendPaginated(rows, { page, limit, total });
 */
export function sendPaginated<T>(
  data: T,
  pagination: PaginationInput,
  status: number = 200,
) {
  return NextResponse.json(paginatedBody(data, pagination), { status });
}

/**
 * Return a `NextResponse` containing an **error** payload.
 *
 * @param message  Human-readable error message.
 * @param status   HTTP status code (default `500`).
 *
 * @example
 * return sendError('Unauthorized', 401);
 */
export function sendError(message: string, status: number = 500) {
  return NextResponse.json(errorBody(message), { status });
}
