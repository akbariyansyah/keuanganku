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
    const client = await pool.connect();
    try {
        const body: CreateInvestmentRequest = await request.json();

        await client.query("BEGIN");

        const insertInvestmentQuery =
            `INSERT INTO investments (date, total) VALUES ($1, $2) RETURNING id;`;
        const insertInvestmentArgs = [body.date, body.total_amount];

        const { rows } = await client.query(insertInvestmentQuery, insertInvestmentArgs);
        const investmentId: number = rows[0].id;

        if (body.items?.length) {
            // 5 columns total → 5 placeholders per row
            // $1 is the investmentId
            const valuesPlaceholders = body.items
                .map((_, i) => {
                    const base = i * 4; // 4 per item after the shared $1
                    return `($1, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
                })
                .join(", ");

            const insertItemQuery = `
        INSERT INTO investment_items (investment_id, asset_type, category_id, ticker, valuation)
        VALUES ${valuesPlaceholders};
      `;

            const insertItemArgs = [
                investmentId,
                ...body.items.flatMap(item => [
                    item.type,
                    item.category_id,
                    item.ticker,
                    item.valuation,
                ]),
            ];

            await client.query(insertItemQuery, insertItemArgs);
        }

        await client.query("COMMIT");
        return NextResponse.json(
            { message: "investment created successfully" },
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (err: any) {
        await client.query("ROLLBACK");
        return NextResponse.json(
            { errors_message: `failed to create portfolio: ${err?.message ?? err}` },
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        client.release();
    }
}
