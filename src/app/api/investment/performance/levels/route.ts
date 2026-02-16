import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { LEVELS } from '@/constant/level';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }
    const { rows } = await pool.query(
      'SELECT COALESCE(total, 0)::float AS total FROM investments WHERE created_by = $1 ORDER BY date DESC NULLS LAST, id DESC LIMIT 1',
      [userId],
    );
    const currentValue = Number(rows?.[0]?.total ?? 0);

    return sendSuccess({
      current_value: currentValue,
      levels: LEVELS,
    });
  } catch (err) {
    console.error('investment performance levels error:', err);
    return sendError('Failed to fetch performance levels', 500);
  }
}
