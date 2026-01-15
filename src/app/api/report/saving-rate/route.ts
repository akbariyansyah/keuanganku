import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

const SAVING_CATEGORY_ID = 9;
const MONTHS_TO_INCLUDE = 12;

type SavingRateRow = {
  month_id: string;
  month_label: string;
  income_total: number;
  saving_total: number;
};

const savingRateQuery = `
    WITH saving_months AS (
        SELECT date_trunc('month', created_at) AS month_start
        FROM transactions
        WHERE created_by = $1
          AND category_id = $2
        GROUP BY 1
        ORDER BY month_start DESC
        LIMIT $3
    ),
    months AS (
        SELECT month_start
        FROM saving_months
        ORDER BY month_start
    ),
    income AS (
        SELECT date_trunc('month', created_at) AS month_start,
               SUM(amount)::float AS income_total
        FROM transactions
        WHERE created_by = $1
          AND type = 'IN'
        GROUP BY 1
    ),
    savings AS (
        SELECT date_trunc('month', created_at) AS month_start,
               SUM(amount)::float AS saving_total
        FROM transactions
        WHERE created_by = $1
          AND category_id = $2
        GROUP BY 1
    )
    SELECT
        to_char(m.month_start, 'YYYY-MM') AS month_id,
        to_char(m.month_start, 'Mon YYYY') AS month_label,
        COALESCE(i.income_total, 0) AS income_total,
        COALESCE(s.saving_total, 0) AS saving_total
    FROM months m
    LEFT JOIN income i ON i.month_start = m.month_start
    LEFT JOIN savings s ON s.month_start = m.month_start
    ORDER BY m.month_start;
`;

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await pool.query<SavingRateRow>(savingRateQuery, [
      userId,
      SAVING_CATEGORY_ID,
      MONTHS_TO_INCLUDE,
    ]);

    const data = rows.map((row) => {
      const income = Number(row.income_total ?? 0);
      const saving = Number(row.saving_total ?? 0);
      const rate =
        income <= 0 ? 0 : Math.max(0, Math.min(100, (saving / income) * 100));

      return {
        month_id: row.month_id,
        month_label: row.month_label,
        income_total: income,
        saving_total: saving,
        saving_rate: Number(rate.toFixed(2)),
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('saving rate error:', error);
    return NextResponse.json(
      { error: 'failed_to_fetch_saving_rate' },
      { status: 500 },
    );
  }
}
