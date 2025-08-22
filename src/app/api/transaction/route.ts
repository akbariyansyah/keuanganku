// app/api/transaction/route.ts
import { Pool } from "pg";
import { Transaction } from "@/types/transaction";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  try {
    const client = await pool.connect();

  const result = await client.query<Transaction>(
      "SELECT id, amount, created_at, description FROM transactions ORDER BY created_at DESC LIMIT 100"
    );

    client.release();

    const transaction = result.rows; // all

    return new Response(JSON.stringify({ data: transaction }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("DB error:", error);
    return new Response(JSON.stringify({ error: "Database query failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
