import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";
import { NextRequest } from "next/server";

export async function PUT(
    request: NextRequest,
    context : { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdfromToken(request);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { id } = await context.params;
        if (!id) {
            return new Response(JSON.stringify({ error: "Transaction ID is required" }), { status: 400 });
        }

        const body: UpdateTransactionRequest = await request.json();

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (typeof body.type !== "undefined") {
            updates.push(`type = $${paramIndex++}`);
            values.push(body.type);
        }

        if (Object.prototype.hasOwnProperty.call(body, "category_id")) {
            updates.push(`category_id = $${paramIndex++}`);
            values.push(body.category_id ?? null);
        }

        if (typeof body.amount !== "undefined") {
            updates.push(`amount = $${paramIndex++}`);
            values.push(body.amount);
        }

        if (Object.prototype.hasOwnProperty.call(body, "description")) {
            updates.push(`description = $${paramIndex++}`);
            values.push(body.description ?? null);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: "No fields provided for update" }), { status: 400 });
        }

        const idParamIndex = paramIndex++;
        values.push(id);

        const userParamIndex = paramIndex++;
        values.push(userId);

        const query = `
            UPDATE transactions
            SET ${updates.join(", ")}
            WHERE id = $${idParamIndex} AND created_by = $${userParamIndex}
            RETURNING *;
        `;

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ data: rows[0] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
