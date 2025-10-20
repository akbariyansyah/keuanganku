// /api/report/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";
export async function GET(request: NextRequest) {


  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const sql = `
          SELECT
              c.name AS name,
              SUM(t.amount)::float AS total
            FROM transactions t
            RIGHT JOIN categories c ON t.category_id = c.id 
            WHERE t.created_by = $1
            GROUP BY c.name
            ORDER BY c.name;
          `;
  try {
    const res = await pool.query(sql, [userId]);
    return NextResponse.json({ data: res.rows }, { status: 200 });
  } catch (err) {
    console.error("report summary error:", err);
    return NextResponse.json({ error: "failed_to_fetch_report" }, { status: 500 });
  }
}
