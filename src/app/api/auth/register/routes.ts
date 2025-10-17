import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";


export default async function POST(req: Request) {
    try {
        const requestBody = await req.json();

        const hashedPassword = await bcrypt.hash(requestBody.password, 10);
        const query = `INSERT INTO users (email, username, telegram_username, password)
        VALUES ($1, $2, $3, $4) RETURNING id, email, username, telegram_username`;
        const values = [
            requestBody.email,
            requestBody.username,
            requestBody.telegram_username,
            hashedPassword,
        ];

        const { rows } = await pool.query<{
            id: string;
            email: string;
            username: string;
            telegram_username: string;
        }>(query, values);

        return new Response(
            JSON.stringify(rows[0]),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    };
}