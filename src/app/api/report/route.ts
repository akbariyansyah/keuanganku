import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // comment out SSL if your DATABASE_URL already encodes it correctly
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type"); // "IN" | "OUT" | null
    const tz = searchParams.get("tz") || "Asia/Jakarta";

    // validate type briefly
    const type = typeParam && (typeParam === "IN" || typeParam === "OUT") ? typeParam : null;

    // NOTE: change "transactions" below to your actual table name if different.
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
      COALESCE(SUM(CASE WHEN r.created_local >= b.month_start THEN r.amount END), 0)::numeric(12,2)   AS this_month
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
