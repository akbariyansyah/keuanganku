import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `SELECT * FROM investments i join investment_item ii ON i.id = ii.investment_id`;
        const { rows } = await pool.query(query);

        return new Response(JSON.stringify({ data: rows }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: "failed_to_fetch_portfolio" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

type Item = {
    type: string;
    category_id: number;
    ticker: string;
    value: number;
    valuation: number;

}
type CreateInvestmentRequesy = {
    date: string;
    total: number;
    items: Item[];
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateInvestmentRequesy = await request.json();

    } catch (err) {
        return NextResponse.json({
            "errors_message": "failed to create portfolio" + err
        }, {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}