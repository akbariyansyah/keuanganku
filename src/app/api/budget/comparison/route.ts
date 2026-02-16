import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';

/**
 * GET /api/budget/comparison?month=2026-01
 * Compare planned budget vs actual spending for a specific month
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }
    if (!month) {
      return sendError('Month parameter is required (YYYY-MM)', 400);
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return sendError('Invalid month format. Use YYYY-MM', 400);
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
        ba.category_id,
        c.name as category_name,
        ba.amount
      FROM budget_allocations ba
      LEFT Join budgets b on ba.budget_id = b.id::varchar
      LEFT JOIN categories c ON ba.category_id = c.id
      WHERE b.date = $1 AND ba.created_by = $2
      ORDER BY ba.category_id ASC
    `;

    // Query 2: Get actual spending (transactions with type='OUT') for the month
    const actualQuery = `
      SELECT 
        t.category_id,
        c.name as category_name,
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

    const planned_by_category = plannedResult.rows;
    const actual_by_category = actualResult.rows;

    // Calculate totals
    const planned_total = planned_by_category.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const actual_total = actual_by_category.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    return sendSuccess({
      period: month,
      planned_total,
      actual_total,
      variance: planned_total - actual_total, // Positive = under budget, Negative = over budget
      variance_percent:
        planned_total > 0
          ? ((actual_total / planned_total) * 100).toFixed(2)
          : 0,
      planned_by_category,
      actual_by_category,
    });
  } catch (err) {
    console.error('Budget comparison error:', err);
    return sendError('Internal server error', 500);
  }
}
