
import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

const ALLOWED_TYPES = ["IN", "OUT"];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const typeParam = searchParams.get("type");

        let query = "SELECT id, name, description, transaction_type FROM categories";
        const values: string[] = [];

        if (typeParam) {
            const normalizedType = typeParam.toUpperCase();
            if (!ALLOWED_TYPES.includes(normalizedType)) {
                return new Response(JSON.stringify({ error: "Invalid category type" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
            query += " WHERE transaction_type = $1";
            values.push(normalizedType);
        }

        query += " ORDER BY id ASC";

        const { rows } = await pool.query(query, values);
        return new Response(JSON.stringify({ data: rows }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("transaction categories error:", err);
        return new Response(JSON.stringify({ error: "failed_to_fetch_categories" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
