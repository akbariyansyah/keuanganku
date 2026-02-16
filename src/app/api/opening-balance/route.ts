import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { sendSuccess, sendError } from '@/lib/api-response';

export interface OpeningBalance {
  id: string;
  user_id: string;
  period: string; // ISO date
  amount: number;
  created_at: string;
  created_by: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }
    const period = request.nextUrl.searchParams.get('period');
    if (!period) {
      return sendError('Period is required (YYYY-MM)', 400);
    }

    const query = `
      SELECT
        id,
        user_id,
        period,
        amount,
        created_at,
        created_by
      FROM opening_balances
      WHERE user_id = $1 AND period = $2
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId, period]);

    if (rows.length === 0) {
      return sendError('Opening balance not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (err) {
    return sendError(`Something went wrong: ${err}`, 500);
  }
}
