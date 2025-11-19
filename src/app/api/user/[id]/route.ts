import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";
import { NextRequest, NextResponse } from "next/server";

// GET /api/user/[id]
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

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

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdfromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        if (!id || id !== userId) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body: UpdateUserRequest = await request.json();
        const { fullname, username, email } = body;

        if (!fullname || !username || !email) {
            return NextResponse.json(
                { error: "fullname, username, and email are required" },
                { status: 400 }
            );
        }

        const { rows } = await pool.query(
            `UPDATE users
             SET fullname = $1, username = $2, email = $3
             WHERE id = $4
             RETURNING id, email, fullname, avatar_url, username`,
            [fullname, username, email, id]
        );

        if (!rows.length) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Profile updated successfully", data: rows[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
