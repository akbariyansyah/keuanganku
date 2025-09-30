import { pool } from "@/lib/db";
import { headers } from "next/headers";
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

        const insertInvestmentQuery = `INSERT INTO investments (date, total) VALUES ($1, $2);`;

        const insertInvestmentArgs = [body.date, body.total];

        const investmentId = await pool.query(insertInvestmentQuery, insertInvestmentArgs);

        const insertItemQuery = `
            INSERT INTO investment_items (investment_id, type, category_id, ticker, value, valuation)
            VALUES ${body.items.map((_, i) =>
            `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5}, $${i * 5 + 6})`
        ).join(", ")}`;

        const insertItemArgs = [
            investmentId,
            ...body.items.flatMap(item => [
                item.type, item.category_id, item.ticker, item.value, item.valuation
            ])
        ];

        await pool.query(insertItemQuery, insertItemArgs);

        return NextResponse.json({ status: 201, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return NextResponse.json({
            "errors_message": "failed to create portfolio" + err
        }, {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}