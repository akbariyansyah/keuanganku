/**
 * ═══════════════════════════════════════════════════════════════
 * API Response Wrapper — Usage Examples
 * ═══════════════════════════════════════════════════════════════
 *
 * This file demonstrates how to use the standardized API response
 * wrappers across different API route scenarios.
 *
 * Helpers available from `@/lib/api-response`:
 *   • sendSuccess(data, status?)      → non-paginated success
 *   • sendPaginated(data, pagination, status?) → paginated success
 *   • sendError(message, status?)     → error response
 *   • createPaginationMeta(input)     → build meta object manually
 *
 * Types available from `@/types/api/api-response`:
 *   • SuccessResponse<T>
 *   • PaginatedResponse<T>
 *   • ErrorResponse
 *   • PaginationMeta
 *   • ApiResponse<T>             → SuccessResponse<T> | ErrorResponse
 *   • PaginatedApiResponse<T>    → PaginatedResponse<T> | ErrorResponse
 *   • isErrorResponse(res)       → type guard
 *   • isPaginatedResponse(res)   → type guard
 *   • isSuccessResponse(res)     → type guard
 */

// ─────────────────────────────────────────────────────────────
// EXAMPLE 1 — GET with Pagination (e.g. /api/transaction)
// ─────────────────────────────────────────────────────────────
/*
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendPaginated, sendError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return sendError('Unauthorized', 401);
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    );

    const totalRes = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE created_by = $1',
      [userId],
    );
    const total = parseInt(totalRes.rows[0].count, 10);

    // ✅ Paginated response
    return sendPaginated(rows, { page, limit, total });

    // Response shape:
    // {
    //   "data": [...],
    //   "meta": {
    //     "page": 1,
    //     "total_pages": 5,
    //     "limit": 10,
    //     "total": 50
    //   }
    // }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return sendError(message, 500);

    // Response shape:
    // { "error_message": "Failed to fetch transactions" }
  }
}
*/

// ─────────────────────────────────────────────────────────────
// EXAMPLE 2 — POST (e.g. /api/budget)
// ─────────────────────────────────────────────────────────────
/*
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const body = await req.json();
    const { amount, periode } = body;

    if (!amount || !periode) {
      return sendError('Missing required fields', 400);
    }

    const { rows } = await pool.query(
      `INSERT INTO budgets (user_id, amount, periode, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, amount, periode, created_by, created_at`,
      [userId, amount, periode, userId],
    );

    // ✅ Success response (201 Created)
    return sendSuccess(rows[0], 201);

    // Response shape:
    // {
    //   "data": {
    //     "id": "abc",
    //     "user_id": "...",
    //     "amount": 5000000,
    //     "periode": "2026-02-01",
    //     "created_by": "...",
    //     "created_at": "..."
    //   }
    // }
  } catch (err: any) {
    if (err.code === '23505') {
      return sendError('Budget for this period already exists', 409);
    }
    return sendError('Internal server error', 500);
  }
}
*/

// ─────────────────────────────────────────────────────────────
// EXAMPLE 3 — PUT (e.g. /api/transaction/[id])
// ─────────────────────────────────────────────────────────────
/*
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const body = await req.json();
    const { amount, description } = body;

    const { rows, rowCount } = await pool.query(
      `UPDATE transactions SET amount = $1, description = $2
       WHERE id = $3 AND created_by = $4
       RETURNING *`,
      [amount, description, params.id, userId],
    );

    if (rowCount === 0) {
      return sendError('Transaction not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update transaction';
    return sendError(message, 500);
  }
}
*/

// ─────────────────────────────────────────────────────────────
// EXAMPLE 4 — DELETE (e.g. /api/transaction/[id])
// ─────────────────────────────────────────────────────────────
/*
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const { rowCount } = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND created_by = $2',
      [params.id, userId],
    );

    if (rowCount === 0) {
      return sendError('Transaction not found', 404);
    }

    // ✅ Success with null data (nothing to return)
    return sendSuccess(null);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete transaction';
    return sendError(message, 500);
  }
}
*/

// ─────────────────────────────────────────────────────────────
// EXAMPLE 5 — Client-side usage with type guards
// ─────────────────────────────────────────────────────────────
/*
import type { ApiResponse, PaginatedApiResponse } from '@/types/api/api-response';
import { isErrorResponse, isPaginatedResponse } from '@/types/api/api-response';

type Transaction = {
  id: string;
  amount: number;
  description: string;
};

// Non-paginated fetch
async function fetchBudget(id: string) {
  const res = await fetch(`/api/budget/${id}`);
  const json: ApiResponse<BudgetResponse> = await res.json();

  if (isErrorResponse(json)) {
    console.error(json.error_message);
    return;
  }

  // TypeScript knows `json` is SuccessResponse<BudgetResponse> here
  console.log(json.data);
}

// Paginated fetch
async function fetchTransactions(page: number) {
  const res = await fetch(`/api/transaction?page=${page}&limit=10`);
  const json: PaginatedApiResponse<Transaction[]> = await res.json();

  if (isErrorResponse(json)) {
    console.error(json.error_message);
    return;
  }

  // TypeScript knows `json` is PaginatedResponse<Transaction[]> here
  console.log(json.data);            // Transaction[]
  console.log(json.meta.page);       // number
  console.log(json.meta.total_pages); // number
}
*/
