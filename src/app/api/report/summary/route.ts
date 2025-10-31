// /api/report/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
        const sql = `
            SELECT c.name, COALESCE(SUM(t.amount), 0)::float AS total
            FROM categories c
            LEFT JOIN transactions t
              ON t.category_id = c.id
            AND t.created_by = $1
            AND t.created_at >= date_trunc('month', now())
            AND t.created_at <  date_trunc('month', now()) + interval '1 month'
            WHERE t.type ='OUT'
            GROUP BY c.name
            ORDER BY c.name;
    `;
    const res = await pool.query(sql, [userId]);
    return NextResponse.json({ data: res.rows }, { status: 200 });
  } catch (err) {
    console.error("report summary error:", err);
    return NextResponse.json({ error: "failed_to_fetch_report" }, { status: 500 });
  }
}
