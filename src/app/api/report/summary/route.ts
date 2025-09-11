// /api/report/summary/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    const sql = `
  SELECT
      c.name AS name,
      SUM(t.amount)::float AS total
    FROM transactions t
    RIGHT JOIN categories c ON t.category_id = c.id
    GROUP BY c.name
    ORDER BY c.name;
  `;
    try {
        const res = await pool.query(sql);
        return NextResponse.json({ data: res.rows }, { status: 200 });
    } catch (err) {
        console.error("report summary error:", err);
        return NextResponse.json({ error: "failed_to_fetch_report" }, { status: 500 });
    }
}
