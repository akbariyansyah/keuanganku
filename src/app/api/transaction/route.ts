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

    const descriptionSearch = searchParams.get("description")?.trim();
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const normalizeDate = (value: string | null, boundary: "start" | "end") => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        if (boundary === "start") {
            date.setHours(0, 0, 0, 0);
        } else {
            date.setHours(23, 59, 59, 999);
        }
        return date;
    };

    const startDateFilter = normalizeDate(startDateParam, "start");
    const endDateFilter = normalizeDate(endDateParam, "end");

    try {
        const filters: string[] = ["t.created_by = $1"];
        const filterParams: (string | number | Date)[] = [userId];

        if (descriptionSearch) {
            filterParams.push(`%${descriptionSearch}%`);
            filters.push(`t.description ILIKE $${filterParams.length}`);
        }

        if (startDateFilter) {
            filterParams.push(startDateFilter);
            filters.push(`t.created_at >= $${filterParams.length}`);
        }

        if (endDateFilter) {
            filterParams.push(endDateFilter);
            filters.push(`t.created_at <= $${filterParams.length}`);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

        // query for data
        const query = `SELECT t.id, t.type, t.amount, t.created_at, t.created_by, c.name as category_name, c.id as category_id, t.description
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;
        const { rows } = await pool.query(query, [...filterParams, limit, offset]);

        // query for total count scoped to the current user
        const totalQuery = `SELECT COUNT(*) FROM transactions t JOIN categories c ON t.category_id = c.id ${whereClause}`;
        const totalRes = await pool.query(totalQuery, filterParams);
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
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch transactions";
        return new Response(JSON.stringify({ error: message }), { status: 500 });
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
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create transaction";
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
};
