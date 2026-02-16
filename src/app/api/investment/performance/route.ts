import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }
    const { rows } = await pool.query(
      'SELECT id, total::float AS total, date FROM investments WHERE created_by = $1 ORDER BY date ASC',
      [userId],
    );

    return sendSuccess(rows);
  } catch (err) {
    console.error('investment performance error:', err);
    return sendError('Failed to fetch performance', 500);
  }
}
