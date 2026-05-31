import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

const TIME_ZONE = 'Asia/Jakarta';

type CashflowRow = {
  income: number | null;
  expenses: number | null;
  net: number | null;
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

  let rangeStart: string;
  let rangeEnd: string;

  if (startDate && endDate) {
    rangeStart = startDate;
    rangeEnd = endDate;
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0) - 7 * 60 * 60 * 1000);
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999) - 7 * 60 * 60 * 1000);
    rangeStart = startOfMonth.toISOString();
    rangeEnd = endOfMonth.toISOString();
  }

  sql = `
  WITH ob AS (
    SELECT amount, created_at
    FROM transactions
    WHERE created_by = $1 AND type = 'OB'
    LIMIT 1
  ),
  bounds AS (
    SELECT
      ($3::timestamptz AT TIME ZONE $2) AS range_start,
      ($4::timestamptz AT TIME ZONE $2) AS range_end
  )
  SELECT
    -- INCOME: filter only for this month (for display)
    COALESCE(SUM(CASE WHEN t.type = 'IN'
      AND (t.created_at AT TIME ZONE $2) >= b.range_start
      AND (t.created_at AT TIME ZONE $2) <= b.range_end
      THEN t.amount END), 0)::numeric(18,2) AS income,

    -- EXPENSES: filter only for this month (for display)
    COALESCE(SUM(CASE WHEN t.type = 'OUT'
      AND (t.created_at AT TIME ZONE $2) >= b.range_start
      AND (t.created_at AT TIME ZONE $2) <= b.range_end
      THEN t.amount END), 0)::numeric(18,2) AS expenses,

    -- NET: OB + All IN/OUT after OB s/d endDate
    COALESCE((SELECT amount FROM ob), 0) +
    COALESCE(SUM(CASE WHEN t.type = 'IN'
      AND t.created_at > (SELECT created_at FROM ob)
      AND (t.created_at AT TIME ZONE $2) <= b.range_end
      THEN t.amount END), 0) -
    COALESCE(SUM(CASE WHEN t.type = 'OUT'
      AND t.created_at > (SELECT created_at FROM ob)
      AND (t.created_at AT TIME ZONE $2) <= b.range_end
      THEN t.amount END), 0)
    AS net

  FROM transactions t
  CROSS JOIN bounds b
  WHERE t.created_by = $1

`;

  queryParams = [userId, TIME_ZONE, rangeStart, rangeEnd];

  console.log('Executing cashflow report with params:', sql, queryParams);

  try {
    const { rows } = await pool.query<CashflowRow>(sql, queryParams);
    const income = Number(rows[0]?.income ?? 0);
    const expenses = Number(rows[0]?.expenses ?? 0);

    const net = Number(rows[0]?.net ?? 0);
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
