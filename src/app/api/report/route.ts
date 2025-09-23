import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sql = `
      WITH bounds AS (
        SELECT
            date_trunc('day',   (now() AT TIME ZONE 'Asia/Jakarta')) AS day_start,
            date_trunc('week',  (now() AT TIME ZONE 'Asia/Jakarta')) AS week_start,
            date_trunc('month', (now() AT TIME ZONE 'Asia/Jakarta')) AS month_start
    ),
    rows AS (
        SELECT
            amount,
            (created_at AT TIME ZONE 'Asia/Jakarta') AS created_local
        FROM transactions
        WHERE type = 'OUT'
    )
    SELECT
        COALESCE(SUM(CASE WHEN r.created_local >= b.day_start   THEN r.amount END), 0)::numeric(12,2)   AS today,
        COALESCE(SUM(CASE WHEN r.created_local >= b.week_start  THEN r.amount END), 0)::numeric(12,2)   AS this_week,
        COALESCE(SUM(CASE WHEN r.created_local >= b.month_start THEN r.amount END), 0)::numeric(12,2)   AS this_month,
        COUNT(*) AS total_transactions
    FROM rows r
    CROSS JOIN bounds b;

  `;

  try {
    const { rows } = await pool.query(sql);
    const row = rows[0] || { today: 0, this_week: 0, this_month: 0 };

    return NextResponse.json({
      data: {
        today: { value: Number(row.today) },
        this_week: { value: Number(row.this_week) },
        this_month: { value: Number(row.this_month) },
        total_transaction: { value: Number(row.total_transactions) }
      },
    });
  } catch (err: any) {
    console.error("report summary error:", err);
    return NextResponse.json(
      { error: "failed_to_fetch_report" },
      { status: 500 }
    );
  }
}
