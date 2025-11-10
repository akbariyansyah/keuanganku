import { pool } from "@/lib/db";
import { ulid } from 'ulid';
import { NextRequest } from "next/server";
import getUserIdfromToken from "@/lib/user-id";


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const userId = await getUserIdfromToken(request);
    if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // query params for pagination
    const page = parseInt(searchParams.get("page") || "1", 10);  // default page 1
    const limit = parseInt(searchParams.get("limit") || "10", 10); // default 10 items

    const offset = (page - 1) * limit;

    try {
        // query for data
        const query = "SELECT t.id, t.type, t.amount, t.created_at, t.created_by, c.name as category_name, c.id as category_id, t.description FROM transactions t JOIN categories c ON t.category_id = c.id WHERE created_by = $1 ORDER BY t.created_at DESC LIMIT $2 OFFSET $3";
        const { rows } = await pool.query(query, [userId, limit, offset]);

        // query for total count scoped to the current user
        const totalRes = await pool.query("SELECT COUNT(*) FROM transactions t JOIN categories c ON t.category_id = c.id WHERE created_by = $1", [userId]);
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

export async function POST(request: NextRequest) {
    try {
        const body: CreateTransactionRequest = await request.json();
        const { type, category_id, amount, description, created_at } = body;

        const userId = await getUserIdfromToken(request);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const id = ulid();
        const createdAt = created_at ? new Date(created_at) : new Date();
        if (Number.isNaN(createdAt.getTime())) {
            return new Response(JSON.stringify({ error: "Invalid transaction time" }), { status: 400 });
        }
        const { rows } = await pool.query(
            "INSERT INTO transactions (id, type, category_id, amount, description, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [id, type, category_id ?? null, amount, description ?? null, userId, createdAt]
        );

        return new Response(JSON.stringify({ data: rows[0] }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
