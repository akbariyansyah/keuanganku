import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

const MONTHS_TO_INCLUDE = 12;
const SAVING_CATEGORY_ID = [9];

const cashflowQuery = `
    WITH months AS (
        SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - ($2::int - 1) * INTERVAL '1 month',
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
        ) AS month_start
    ),
    income AS (
        SELECT date_trunc('month', created_at) AS month_start,
               SUM(amount)::float AS income_total
        FROM transactions
        WHERE created_by = $1
          AND type = 'IN'
          AND created_at >= date_trunc('month', CURRENT_DATE) - ($2::int - 1) * INTERVAL '1 month'
        GROUP BY 1
    ),
    expenses AS (
        SELECT date_trunc('month', created_at) AS month_start,
               SUM(amount)::float AS expense_total
        FROM transactions
        WHERE created_by = $1
          AND type = 'OUT'
          AND (category_id IS NULL OR category_id NOT IN (SELECT unnest($3::int[])))
          AND created_at >= date_trunc('month', CURRENT_DATE) - ($2::int - 1) * INTERVAL '1 month'
        GROUP BY 1
    )
    SELECT
        to_char(m.month_start, 'YYYY-MM') AS month_id,
        to_char(m.month_start, 'Mon YYYY') AS month_label,
        COALESCE(i.income_total, 0) AS income_total,
        COALESCE(e.expense_total, 0) AS expense_total
    FROM months m
    LEFT JOIN income i ON i.month_start = m.month_start
    LEFT JOIN expenses e ON e.month_start = m.month_start
    ORDER BY m.month_start;
`;

type CashflowOvertimeRow = {
  month_id: string;
  month_label: string;
  income_total: number;
  expense_total: number;
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await pool.query<CashflowOvertimeRow>(cashflowQuery, [
      userId,
      MONTHS_TO_INCLUDE,
      SAVING_CATEGORY_ID,
    ]);

    const data = rows
      .map((row) => {
        const income = Number(row.income_total ?? 0);
        const expenses = Number(row.expense_total ?? 0);
        return {
          month_id: row.month_id,
          month_label: row.month_label,
          income_total: income,
          expense_total: expenses,
          cashflow: Number((income - expenses).toFixed(2)),
        };
      })
      .filter((row) => row.income_total !== 0 || row.expense_total !== 0);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('cashflow overtime error:', error);
    return NextResponse.json(
      { error: 'failed_to_fetch_cashflow_overtime' },
      { status: 500 },
    );
  }
}
