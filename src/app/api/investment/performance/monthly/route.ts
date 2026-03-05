import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

/**
 * GET /api/investment/performance/monthly
 *
 * Returns monthly portfolio return percentages using the formula:
 *   return% = (ending_value - starting_value - net_deposit) / starting_value * 100
 *
 * - ending_value   : last recorded investment total in the month
 * - starting_value : ending_value of the previous month (i.e. the portfolio
 *                    value carried into this month before any change)
 * - net_deposit    : sum(IN transactions) - sum(OUT transactions) for the month
 *
 * Deposits / withdrawals are subtracted so that cash inflows are never
 * mistaken for investment gains.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const query = `
      WITH monthly_last AS (
        -- One row per month: the last recorded portfolio snapshot
        SELECT DISTINCT ON (TO_CHAR(date, 'YYYY-MM'))
          TO_CHAR(date, 'YYYY-MM')  AS month,
          total::float              AS ending_value
        FROM investments
        WHERE created_by = $1
        ORDER BY TO_CHAR(date, 'YYYY-MM'), date DESC
      ),

      monthly_with_prev AS (
        -- Attach the previous month's ending value as starting_value via LAG
        SELECT
          month,
          ending_value,
          LAG(ending_value) OVER (ORDER BY month) AS starting_value
        FROM monthly_last
      ),

      monthly_deposits AS (
        -- Aggregate net cash flows per month (IN = deposit, OUT = withdrawal)
        -- OB (opening balance) is intentionally excluded as it is not a cash flow
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          SUM(CASE WHEN type = 'IN'  THEN amount::float ELSE 0 END) -
          SUM(CASE WHEN type = 'OUT' THEN amount::float ELSE 0 END) AS net_deposit
        FROM transactions
        WHERE created_by = $1
          AND type IN ('IN', 'OUT')
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      )

      SELECT
        m.month,
        ROUND(
          (
            (m.ending_value - m.starting_value - COALESCE(d.net_deposit, 0))
            / NULLIF(m.starting_value, 0)
          )::numeric * 100
        , 2) AS "returnPercent"
      FROM monthly_with_prev m
      LEFT JOIN monthly_deposits d ON m.month = d.month
      WHERE m.starting_value IS NOT NULL         -- skip the very first snapshot (no prior month)
        AND m.starting_value <> 0                -- prevent division-by-zero
      ORDER BY m.month ASC;
    `;

    const { rows } = await pool.query(query, [userId]);

    return sendSuccess(rows);
  } catch (err) {
    console.error('monthly performance error:', err);
    return sendError(`Failed to fetch monthly performance: ${err}`, 500);
  }
}
