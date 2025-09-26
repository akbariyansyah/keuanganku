import { pool } from "@/lib/db";

export async function GET() {
    try {
        const query = `SELECT * FROM investments i join investment_item ii ON i.id = ii.investment_id`;
        const { rows } = await pool.query(query);

        return new Response(JSON.stringify({ data: rows }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: "failed_to_fetch_portfolio" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export function POST(request: Request) {

}