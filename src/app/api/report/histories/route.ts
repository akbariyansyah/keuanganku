import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


export async function GET(request: Request) {

    const sql = `select amount, created_at from transactions where type = 'OUT' order by created_at desc limit 30;`;

    try {
        const rows = await pool.query(sql);

        return NextResponse.json({ data: rows.rows }, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    catch (err: any) {
        console.error("report histories error:", err);
        return NextResponse.json(
            { error: "failed_to_fetch_report" },
            { status: 500 }
        );
    }


}