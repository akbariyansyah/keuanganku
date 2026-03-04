import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

const TIME_ZONE = 'Asia/Jakarta';

type CashflowRow = {
  opening_balance: number | null;
  income: number | null;
  expenses: number | null;
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return sendError('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let sql: string;
  let queryParams: any[];

  if (startDate && endDate) {
    // Filter by date range
    sql = `
      SELECT
      COALESCE(SUM(CASE WHEN type = 'OB' THEN amount END), 0)::numeric(18,2) AS opening_balance,
        COALESCE(SUM(CASE WHEN type = 'IN' THEN amount END), 0)::numeric(18,2) AS income,
        COALESCE(SUM(CASE WHEN type = 'OUT' THEN amount END), 0)::numeric(18,2) AS expenses
      FROM transactions
      WHERE created_by = $1
        AND (created_at AT TIME ZONE $2) >= $3::timestamp
        AND (created_at AT TIME ZONE $2) <= $4::timestamp
    `;
    queryParams = [userId, TIME_ZONE, startDate, endDate];
  } else {
    // Default: current month
    sql = `
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
        COALESCE(SUM(CASE WHEN r.type = 'OB' THEN r.amount END), 0)::numeric(18,2) AS opening_balance,
        COALESCE(SUM(CASE WHEN r.type = 'IN' AND r.created_local >= b.month_start THEN r.amount END), 0)::numeric(18,2) AS income,
        COALESCE(SUM(CASE WHEN r.type = 'OUT' AND r.created_local >= b.month_start THEN r.amount END), 0)::numeric(18,2) AS expenses
      FROM rows r
      CROSS JOIN bounds b;
    `;
    queryParams = [TIME_ZONE, userId];
  }

  try {
    const { rows } = await pool.query<CashflowRow>(sql, queryParams);
    const openingBalance = Number(rows[0]?.opening_balance ?? 0);
    const income = Number(rows[0]?.income ?? 0);
    const expenses = Number(rows[0]?.expenses ?? 0);

    const net: number = openingBalance + income - expenses;
    return sendSuccess({
      income,
      expenses,
      net: net,
    });
  } catch (err) {
    console.error('cashflow report error:', err);
    return sendError('Failed to fetch cashflow', 500);
  }
}
