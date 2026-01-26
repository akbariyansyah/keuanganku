import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

/**
 * GET /api/budget/comparison?month=2026-01
 * Compare planned budget vs actual spending for a specific month
 *
 * Returns:
 * {
 *   period: "2026-01",
 *   plannedTotal: number,
 *   actualTotal: number,
 *   plannedByCategory: [{ categoryId, categoryName, amount }],
 *   actualByCategory: [{ categoryId, categoryName, amount }]
 * }
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

    const monthStart = month + '-01';

    // Calculate the last day of the month
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = new Date(year, monthNum, 1); // First day of next month
    const monthEnd = new Date(nextMonth.getTime() - 1); // Last millisecond of current month
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Query 1: Get planned budget allocations for the month
    const plannedQuery = `
      SELECT 
        ba.category_id as "categoryId",
        c.name as "categoryName",
        ba.amount
      FROM budget_allocations ba
      LEFT JOIN categories c ON ba.category_id = c.id
      WHERE ba.month = $1 AND ba.created_by = $2
      ORDER BY ba.category_id ASC
    `;

    // Query 2: Get actual spending (transactions with type='OUT') for the month
    const actualQuery = `
      SELECT 
        t.category_id as "categoryId",
        c.name as "categoryName",
        SUM(t.amount) as amount
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'OUT'
        AND t.created_by = $3
        AND t.created_at >= $1::date
        AND t.created_at < ($2::date + INTERVAL '1 day')
      GROUP BY t.category_id, c.name
      ORDER BY t.category_id ASC
    `;

    // Execute both queries in parallel
    const [plannedResult, actualResult] = await Promise.all([
      pool.query(plannedQuery, [monthStart, userId]),
      pool.query(actualQuery, [monthStart, monthEndStr, userId]),
    ]);

    const plannedByCategory = plannedResult.rows;
    const actualByCategory = actualResult.rows;

    // Calculate totals
    const plannedTotal = plannedByCategory.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const actualTotal = actualByCategory.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    return NextResponse.json(
      {
        period: month,
        plannedTotal,
        actualTotal,
        variance: plannedTotal - actualTotal, // Positive = under budget, Negative = over budget
        variancePercent:
          plannedTotal > 0
            ? ((actualTotal / plannedTotal) * 100).toFixed(2)
            : 0,
        plannedByCategory,
        actualByCategory,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Budget comparison error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
