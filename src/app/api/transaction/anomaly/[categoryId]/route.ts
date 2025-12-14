import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: { categoryId: string } }
) {
    try {
        const userId = await getUserIdfromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { categoryId } = await context.params;
        if (!categoryId) {
            return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
        }

        const query = `
            SELECT 
                t.id,
                c.name,
                t.category_id,
                t.amount,
                t.created_at,
                t.description,
                t.type
            FROM transactions t join categories c ON t.category_id = c.id
            WHERE created_by = $1
                AND category_id = $2
                AND created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC;
    `;

        const values = [userId, categoryId];
        const { rows } = await pool.query(query, values);

        return NextResponse.json({ data: rows }, { status: 200 });

    } catch (err) {
        console.error("GET anomaly detail error:", err);
        return NextResponse.json(
            { error: "failed_to_fetch_anomaly_detail" },
            { status: 500 }
        );
    }
}
