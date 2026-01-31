import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

/**
 * POST /api/budget/allocations
 * Create budget allocations for a specific month
 *
 * Request body:
 * {
 *   month: "2026-01",  // YYYY-MM format
 *   allocations: [
 *     { categoryId: 1, amount: 500000 },
 *     { categoryId: 2, amount: 300000 }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { month, allocations } = body;

    // Validation
    if (!month || !allocations || !Array.isArray(allocations)) {
      return NextResponse.json(
        {
          error:
            'Invalid request body. Required: month (YYYY-MM), allocations (array)',
        },
        { status: 400 },
      );
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 },
      );
    }

    // Validate allocations
    for (const allocation of allocations) {
      if (
        !allocation.categoryId ||
        !allocation.amount ||
        allocation.amount <= 0
      ) {
        return NextResponse.json(
          { error: 'Each allocation must have categoryId and amount > 0' },
          { status: 400 },
        );
      }
    }

    await client.query('BEGIN');

    const headerQuery = `INSERT INTO budgets (date, amount, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id`;

    const result = await client.query(headerQuery, [
      month + '-01',
      allocations.reduce((sum: number, alloc: any) => sum + alloc.amount, 0),
      userId,
    ]);

    // Insert new allocations
    const insertPromises = allocations.map((allocation) =>
      client.query(
        `INSERT INTO budget_allocations (budget_id, category_id, amount, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, budget_id, category_id, amount, created_at`,
        [result.rows[0].id, allocation.categoryId, allocation.amount, userId],
      ),
    );

    const results = await Promise.all(insertPromises);
    const insertedAllocations = results.map((r) => r.rows[0]);

    await client.query('COMMIT');

    return NextResponse.json(
      {
        message: 'Budget allocations created successfully',
        data: insertedAllocations,
      },
      { status: 201 },
    );
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Budget allocation error:', err);

    // Handle foreign key constraint (invalid category_id)
    if (err.code === '23503') {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

/**
 * GET /api/budget/allocations?month=2026-01
 * Fetch budget allocations for a specific month
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required (YYYY-MM)' },
        { status: 400 },
      );
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 },
      );
    }

    const query = `
      SELECT 
        ba.id,
        b.date as month,
        ba.category_id,
        ba.amount,
        ba.created_at,
        c.name as category_name,
        c.description as category_description
      FROM budget_allocations ba
      LEFT JOIN categories c ON ba.category_id = c.id
      LEFT JOIN budgets b on b.id::varchar = ba.budget_id
      WHERE b.date = $1 AND ba.created_by = $2    
      ORDER BY ba.category_id ASC
    `;

    const { rows } = await pool.query(query, [month + '-01', userId]);

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('Fetch budget allocations error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
