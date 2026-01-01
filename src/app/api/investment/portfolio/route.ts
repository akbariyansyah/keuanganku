import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `select
                    i."date",
                    ic.name,
                    SUM(ii.valuation) as total
                    FROM investments i 
                    JOIN investment_items ii ON i.id = ii.investment_id 
                    JOIN investment_categories ic on ii.category_id = ic.id
                    WHERE i.created_by = $1
                    GROUP BY i."date" ,ic.name
                    `;
    const { rows } = await pool.query(query, [userId]);

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `failed_to_fetch_portfolio: ${err}` },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateInvestmentRequest = await request.json();

    await client.query('BEGIN');

    const insertInvestmentQuery = `INSERT INTO investments (date, total, created_by, created_at) VALUES ($1, $2, $3, $4) RETURNING id;`;
    const insertInvestmentArgs = [
      body.date,
      body.total_amount,
      userId,
      body.created_at,
    ];

    const { rows } = await client.query(
      insertInvestmentQuery,
      insertInvestmentArgs,
    );
    const investmentId: number = rows[0].id;

    if (body.items?.length) {
      // 6 columns total → 6 placeholders per row after the shared $1
      const valuesPlaceholders = body.items
        .map((_, i) => {
          const base = i * 6; // 6 dynamic params per item after the shared $1
          return `($1, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
        })
        .join(', ');

      const insertItemQuery = `
            INSERT INTO investment_items (investment_id, asset_type, category_id, ticker, valuation, created_by, created_at)
            VALUES ${valuesPlaceholders};
      `;

      const insertItemArgs = [
        investmentId,
        ...body.items.flatMap((item) => [
          item.type,
          item.category_id,
          item.ticker,
          item.valuation,
          userId,
          body.created_at,
        ]),
      ];

      await client.query(insertItemQuery, insertItemArgs);
    }

    await client.query('COMMIT');
    return NextResponse.json(
      { message: 'investment created successfully' },
      { status: 201 },
    );
  } catch (err: any) {
    await client.query('ROLLBACK');
    return NextResponse.json(
      { errors_message: `failed to create portfolio: ${err?.message ?? err}` },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
