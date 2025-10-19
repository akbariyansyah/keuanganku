import { pool } from "@/lib/db";
import { ulid } from 'ulid';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // query params for pagination
    const page = parseInt(searchParams.get("page") || "1", 10);  // default page 1
    const limit = parseInt(searchParams.get("limit") || "10", 10); // default 10 items

    const offset = (page - 1) * limit;

    try {
        // query for data
        const { rows } = await pool.query(
            "SELECT * FROM transactions ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            [limit, offset]
        );

        // query for total count
        const totalRes = await pool.query("SELECT COUNT(*) FROM transactions");
        const total = parseInt(totalRes.rows[0].count, 10);

        return new Response(
            JSON.stringify({
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, category_id, amount, description } = body;

        const id = ulid();
        const createdAt = new Date();
        const { rows } = await pool.query(
            "INSERT INTO transactions (id, type, category_id, amount, description, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [id, type, category_id, amount, description, createdAt]
        );

        return new Response(JSON.stringify({ data: rows[0] }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};