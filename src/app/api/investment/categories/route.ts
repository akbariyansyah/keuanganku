
import { pool } from "@/lib/db";

export async function GET(request: Request) {

    try {
        const { rows } = await pool.query("SELECT id, name FROM investment_categories ORDER BY name");
        return new Response(JSON.stringify({ data: rows }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("investment categories error:", err);
        return new Response(JSON.stringify({ error: "failed_to_fetch_categories" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}