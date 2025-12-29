// app/api/report/histories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

export async function GET(request: NextRequest) {
  let intervalDays = 7;

  const { searchParams } = new URL(request.url);

  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  intervalDays = parseInt(searchParams.get('interval') || '7', 10);
  const sql = `
    SELECT
      (date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta'))::date AS day,
      COALESCE(SUM(CASE WHEN type = 'IN'  THEN amount END), 0)::float  AS amount_in,
      COALESCE(SUM(CASE WHEN type = 'OUT' THEN amount END), 0)::float  AS amount_out
    FROM transactions
    WHERE created_at >= now() - (${intervalDays} * INTERVAL '1 day') AND created_by = $1
    GROUP BY 1
    ORDER BY 1;
  `;

  try {
    const res = await pool.query(sql, [userId]);
    return NextResponse.json(
      { data: res.rows },
      { status: 200 },
    );
  } catch (err) {
    console.error('report histories error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_report' },
      { status: 500 },
    );
  }
}
