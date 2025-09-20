import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/user/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Find user by ID
        const { rows } = await pool.query(
            "SELECT id, email, fullname, avatar_url, username FROM users WHERE id = $1",
            [id]
        )

        if (!rows.length) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return new Response(JSON.stringify({ data: rows[0] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}