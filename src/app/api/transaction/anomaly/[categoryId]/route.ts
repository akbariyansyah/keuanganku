import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  context: { params: { categoryId: string } },
) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const { categoryId } = await context.params;
    if (!categoryId) {
      return sendError('categoryId is required', 400);
    }

    const query = `
            SELECT 
                t.id,
                c.name,
                t.category_id,
                t.amount,
                t.created_at,
                t.description,
                t.type
            FROM transactions t join categories c ON t.category_id = c.id
            WHERE created_by = $1
                AND category_id = $2
                AND created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC;
    `;

    const values = [userId, categoryId];
    const { rows } = await pool.query(query, values);

    return sendSuccess(rows);
  } catch (err) {
    console.error('GET anomaly detail error:', err);
    return sendError('Failed to fetch anomaly detail', 500);
  }
}
