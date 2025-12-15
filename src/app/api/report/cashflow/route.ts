import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

const TIME_ZONE = 'Asia/Jakarta';

type CashflowRow = {
  income: string | null;
  expenses: string | null;
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = `
    WITH bounds AS (
      SELECT date_trunc('month', (now() AT TIME ZONE $1)) AS month_start
    ),
    rows AS (
      SELECT
        type,
        amount,
        (created_at AT TIME ZONE $1) AS created_local
      FROM transactions
      WHERE created_by = $2
    )
    SELECT
      COALESCE(SUM(CASE WHEN r.type = 'IN' AND r.created_local >= b.month_start THEN r.amount END), 0)::numeric(18,2) AS income,
      COALESCE(SUM(CASE WHEN r.type = 'OUT' AND r.created_local >= b.month_start THEN r.amount END), 0)::numeric(18,2) AS expenses
    FROM rows r
    CROSS JOIN bounds b;
  `;

  try {
    const { rows } = await pool.query<CashflowRow>(sql, [TIME_ZONE, userId]);
    const income = Number(rows[0]?.income ?? 0);
    const expenses = Number(rows[0]?.expenses ?? 0);

    return NextResponse.json({
      data: {
        income,
        expenses,
        net: income - expenses,
      },
    });
  } catch (err) {
    console.error('cashflow report error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_cashflow' },
      { status: 500 },
    );
  }
}
