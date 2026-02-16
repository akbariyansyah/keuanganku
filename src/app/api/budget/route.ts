import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, amount, periode, created_by } = body;

    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }
    if (!user_id || !amount || !periode || !created_by) {
      return sendError('Missing required fields', 400);
    }

    const query = `
      INSERT INTO budgets (user_id, amount, periode, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, amount, periode, created_by, created_at
    `;

    const values = [user_id, amount, periode, created_by];

    const { rows } = await pool.query(query, values);

    return sendSuccess(rows[0], 201);
  } catch (err: any) {
    // unique constraint (user_id + periode)
    if (err.code === '23505') {
      return sendError('Budget for this period already exists', 409);
    }

    console.error(err);
    return sendError('Internal server error', 500);
  }
}
