import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

/**
 * GET /api/investment/invested-capital
 * Returns cumulative invested capital over time from transactions table
 * Filters: type='OUT', category='investment', created_by=current_user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    // Query to calculate cumulative invested capital by month
    // Using window function SUM() OVER (ORDER BY) for cumulative sum
    const sql = `
      WITH monthly_investments AS (
        SELECT 
          DATE_TRUNC('month', t.created_at AT TIME ZONE 'UTC')::date AS month_date,
          SUM(t.amount) AS monthly_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'OUT'
          AND LOWER(c.name) = 'investment'
          AND t.created_by = $1
        GROUP BY DATE_TRUNC('month', t.created_at AT TIME ZONE 'UTC')
      )
      SELECT 
        month_date AS date,
        SUM(monthly_amount) OVER (ORDER BY month_date)::float AS invested_total
      FROM monthly_investments
      ORDER BY month_date ASC;
    `;

    const { rows } = await pool.query(sql, [userId]);

    return sendSuccess(rows);
  } catch (err) {
    console.error('invested performance error:', err);
    return sendError('Failed to fetch invested performance', 500);
  }
}
