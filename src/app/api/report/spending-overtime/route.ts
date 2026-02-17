import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

/**
 * GET /api/report/spending-overtime?months=6
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const monthsParam = url.searchParams.get('months') ?? '6';
    let months = parseInt(monthsParam, 10);
    if (Number.isNaN(months) || months < 1) months = 6;
    months = Math.min(Math.max(months, 1), 36); // clamp 1..36

    const sql = `
      WITH base AS (
        SELECT (now() AT TIME ZONE 'Asia/Jakarta') AS now_local
      ),
      months AS (
        SELECT gs::date AS month_start
        FROM base,
          generate_series(
            date_trunc('month', base.now_local) - ($1 - 1) * INTERVAL '1 month',
            date_trunc('month', base.now_local),
            INTERVAL '1 month'
          ) AS gs
      ),
      cat_names AS (
        SELECT DISTINCT name FROM categories
      )
      SELECT
        cn.name AS category_name,
        to_char(m.month_start, 'YYYY-MM') AS month_key,
        m.month_start AS month_start,
        COALESCE(SUM(t.amount), 0)::float AS total
      FROM months m
      CROSS JOIN cat_names cn
  LEFT JOIN transactions t
  ON t.type = 'OUT'
  AND t.created_by = $2
  AND (t.created_at AT TIME ZONE 'Asia/Jakarta') >= m.month_start
  AND (t.created_at AT TIME ZONE 'Asia/Jakarta') < (m.month_start + INTERVAL '1 month')
  AND t.category_id = (
    SELECT id FROM categories WHERE name = cn.name
  )
    GROUP BY cn.name, m.month_start
    ORDER BY m.month_start ASC, cn.name ASC;
    `;

    const res = await pool.query(sql, [months, userId]);
    type Row = {
      category_name: string;
      month_key: string;
      month_start: string;
      total: number;
    };

    const rows = res.rows as Row[];

    const categoryTotals: Record<string, number> = {};

    for (const r of rows) {
      categoryTotals[r.category_name] =
        (categoryTotals[r.category_name] ?? 0) + Number(r.total ?? 0);
    }

    // Ordered list of month keys (ascending)
    const monthKeySet = new Set<string>();
    for (const r of rows) monthKeySet.add(r.month_key);
    const monthKeys = Array.from(monthKeySet).sort();

    // Unique category names (preserve alphabetical order from query)
    const categories = Array.from(
      new Set(
        rows
          .filter((r) => categoryTotals[r.category_name] > 0)
          .map((r) => r.category_name),
      ),
    );

    const allowedCategories = new Set(categories);

    const filteredRows = rows.filter((r) =>
      allowedCategories.has(r.category_name),
    );

    // Initialize data: for each month, create object mapping category_name -> 0
    const details: Record<string, Record<string, number>> = {};
    for (const mk of monthKeys) {
      details[mk] = {};
      for (const catName of categories) {
        details[mk][catName] = 0;
      }
    }

    // Fill totals
    for (const r of filteredRows) {
      const mk = r.month_key;
      const cname = r.category_name;
      details[mk][cname] = Number(r.total ?? 0);
    }

    return sendSuccess({
      months: monthKeys,
      categories,
      details,
    });
  } catch (err) {
    console.error('category-monthly report error:', err);
    return sendError('Failed to fetch category monthly', 500);
  }
}
