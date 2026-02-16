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

    const query = `SELECT * from journals`;
    const { rows } = (await pool.query(query)) || [];

    return sendSuccess(rows);
  } catch (err) {
    return sendError(`Failed to fetch journal: ${err}`, 500);
  }
}
