import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";


export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // verify the token
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!)
        );

        // in payload.sub you usually put userId at login time
        const userId = String(payload.sub);

        // fetch the user from your DB
        const { rows } = await pool.query(
            "SELECT id, email, fullname, avatar_url, username FROM users WHERE id = $1",
            [userId]
        )

        const user = rows[0]
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err) {
        console.error("Error in /auth/me", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

