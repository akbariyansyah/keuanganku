import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

/**
 * GET /api/investment/performance/monthly
 *
 * Returns the month-over-month return percentage for each month that has a
 * recorded portfolio snapshot.
 *
 * Formula:
 *   returnPercent = (current_value - previous_value) / previous_value * 100
 *
 * Each row in `investments` is treated as the total portfolio value at the
 * end of that month.  A LAG window function supplies the previous snapshot so
 * the comparison is always between consecutive recorded months.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const query = `
      WITH monthly_last AS (
        -- Pick the single last-recorded snapshot for each calendar month.
        -- DISTINCT ON requires ORDER BY to start with the same expression.
        SELECT DISTINCT ON (TO_CHAR(date, 'YYYY-MM'))
          TO_CHAR(date, 'YYYY-MM') AS month,
          total::numeric           AS current_value
        FROM investments
        WHERE created_by = $1
        ORDER BY TO_CHAR(date, 'YYYY-MM'), date DESC
      )

            SELECT
        month,
        ROUND(
            (current_value - prev_value) / NULLIF(prev_value,0) * 100
        ,2)::float AS return_percent
        FROM (
        SELECT
            month,
            current_value,
            LAG(current_value) OVER (ORDER BY month) AS prev_value
        FROM monthly_last
        ) m
        ORDER BY month;
    `;

    const { rows } = await pool.query(query, [userId]);

    // The first row always has returnPercent = NULL (no prior month) — drop it
    const filtered = rows.filter((r) => r.returnPercent !== null);

    return sendSuccess(filtered);
  } catch (err) {
    console.error('monthly performance error:', err);
    return sendError(`Failed to fetch monthly performance: ${err}`, 500);
  }
}

