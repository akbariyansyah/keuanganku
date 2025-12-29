// app/api/assets-growth/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { daysBetween } from '@/utils/date';

type ApiResponse = {
  this_month_amount: number;
  last_month_amount: number;
  this_month_growth_amount: number;
  this_month_growth_percent: number | null;
  overall_oldest_total: number | null;
  overall_latest_total: number | null;
  overall_growth_amount: number | null;
  overall_growth_percent: number | null;
  duration_days?: number;
};

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export async function GET() {
  try {
    // compute month ranges in UTC
    const now = new Date();
    const utcNow = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
      ),
    );

    const startThisMonth = new Date(
      Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1, 0, 0, 0),
    );

    const startLastMonth = new Date(
      Date.UTC(
        startThisMonth.getUTCFullYear(),
        startThisMonth.getUTCMonth() - 1,
        1,
        0,
        0,
        0,
      ),
    );

    const endLastMonth = new Date(startThisMonth.getTime() - 1);

    const client = await pool.connect();

    try {
      // 1) sums for this month and last month
      const sumsQuery = `
        SELECT
          (SELECT COALESCE(SUM(total),0) FROM investments WHERE date >= $1 AND date <= $2) AS this_month_sum,
          (SELECT COALESCE(SUM(total),0) FROM investments WHERE date >= $3 AND date <= $4) AS last_month_sum
      `;

      const sumsRes = await client.query(sumsQuery, [
        startThisMonth.toISOString(),
        utcNow.toISOString(),
        startLastMonth.toISOString(),
        endLastMonth.toISOString(),
      ]);

      const thisMonthSum = parseFloat(sumsRes.rows[0].this_month_sum ?? '0');
      const lastMonthSum = parseFloat(sumsRes.rows[0].last_month_sum ?? '0');

      const thisMonthGrowthAmount = thisMonthSum - lastMonthSum;
      const thisMonthGrowthPercent =
        lastMonthSum === 0
          ? null
          : round((thisMonthGrowthAmount / lastMonthSum) * 100);

      // 2) overall earliest & latest
      const earliestRes = await client.query(`
        SELECT total, date
        FROM investments
        WHERE date IS NOT NULL
        ORDER BY date ASC
        LIMIT 1
      `);

      const earliestTotal: number | null = earliestRes.rowCount
        ? parseFloat(earliestRes.rows[0].total)
        : null;

      const earliestDate: Date | null = earliestRes.rowCount
        ? new Date(earliestRes.rows[0].date)
        : null;

      const latestRes = await client.query(`
        SELECT total, date
        FROM investments
        WHERE date IS NOT NULL
        ORDER BY date DESC
        LIMIT 1
      `);

      const latestTotal: number | null = latestRes.rowCount
        ? parseFloat(latestRes.rows[0].total)
        : null;

      let overallGrowthAmount: number | null = null;
      let overallGrowthPercent: number | null = null;

      if (earliestTotal !== null && latestTotal !== null) {
        overallGrowthAmount = latestTotal - earliestTotal;
        overallGrowthPercent =
          earliestTotal === 0
            ? null
            : round((overallGrowthAmount / earliestTotal) * 100);
      }

      const payload: ApiResponse = {
        this_month_amount: round(thisMonthSum),
        last_month_amount: round(lastMonthSum),
        this_month_growth_amount: round(thisMonthGrowthAmount),
        this_month_growth_percent: thisMonthGrowthPercent,
        overall_oldest_total:
          earliestTotal === null ? null : round(earliestTotal),
        overall_latest_total:
          latestTotal === null ? null : round(latestTotal),
        overall_growth_amount:
          overallGrowthAmount === null ? null : round(overallGrowthAmount),
        overall_growth_percent: overallGrowthPercent,
        duration_days: earliestDate
          ? daysBetween(earliestDate, new Date())
          : undefined,
      };

      return NextResponse.json({ data: payload }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('assets-growth error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_assets_growth' },
      { status: 500 },
    );
  }
}
