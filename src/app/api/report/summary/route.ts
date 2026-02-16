// /api/report/summary/route.ts
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return sendError('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);

  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  try {
    const sql = `
          SELECT c.name,
                COALESCE(SUM(t.amount), 0)::float AS total
          FROM categories c
          LEFT JOIN transactions t
            ON t.category_id = c.id
          AND t.created_by = $1
          AND t.type = 'OUT'
          AND t.created_at >= $2            
          AND t.created_at <  $3            
          GROUP BY c.name
          ORDER BY c.name;

    `;
    const res = await pool.query(sql, [userId, startDateParam, endDateParam]);
    return sendSuccess(res.rows);
  } catch (err) {
    console.error('report summary error:', err);
    return sendError('Failed to fetch report', 500);
  }
}
