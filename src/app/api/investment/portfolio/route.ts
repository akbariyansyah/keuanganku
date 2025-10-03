import { pool } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `select
                    i."date",
                    ic.name,
                    sum(ii.valuation) as total
                    FROM investments i 
                    join investment_items ii ON i.id = ii.investment_id 
                    join investment_categories ic on ii.category_id = ic.id group by i."date" ,ic.name`;
        const { rows } = await pool.query(query);

        return new Response(JSON.stringify({ data: rows }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: "failed_to_fetch_portfolio" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateInvestmentRequest = await request.json();

        const insertInvestmentQuery = `INSERT INTO investments (date, total) VALUES ($1, $2) RETURNING id;`;

        const insertInvestmentArgs = [body.date, body.total_amount];

        const investmentId = (await pool.query(insertInvestmentQuery, insertInvestmentArgs));

        const insertItemQuery = `
            INSERT INTO investment_items (investment_id, asset_type, category_id, ticker, valuation)
            VALUES ${body.items.map((_, i) =>
            `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5}, $${i * 5 + 6})`
        ).join(", ")}`;

        const insertItemArgs = [
            investmentId.rows[0].id,
            ...body.items.flatMap(item => [
                item.type, item.category_id, item.ticker, item.valuation
            ])
        ];
    
        await pool.query(insertItemQuery, insertItemArgs);

        return NextResponse.json({ "message": "investment created succesfully" }, { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return NextResponse.json({
            "errors_message": "failed to create portfolio " + err
        }, {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}