// app/api/investment/performance/cards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { daysBetween } from '@/utils/date';
import getUserIdfromToken from '@/lib/user-id';

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
  current_cagr_percent: number;
};

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export async function GET(request: NextRequest) {
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
      const userId = await getUserIdfromToken(request);
      // 1) sums for this month and last month
      const sumsQuery = `
        SELECT
          (SELECT COALESCE(SUM(total),0) FROM investments WHERE date >= $1 AND date <= $2 AND created_by = $5) AS this_month_sum,
          (SELECT COALESCE(SUM(total),0) FROM investments WHERE date >= $3 AND date <= $4 AND created_by = $5) AS last_month_sum
      `;

      const sumsRes = await client.query(sumsQuery, [
        startThisMonth.toISOString(),
        utcNow.toISOString(),
        startLastMonth.toISOString(),
        endLastMonth.toISOString(),
        userId,
      ]);

      const thisMonthSum = parseFloat(sumsRes.rows[0].this_month_sum ?? '0');
      const lastMonthSum = parseFloat(sumsRes.rows[0].last_month_sum ?? '0');

      const thisMonthGrowthAmount = thisMonthSum - lastMonthSum;
      const thisMonthGrowthPercent =
        lastMonthSum === 0
          ? null
          : round((thisMonthGrowthAmount / lastMonthSum) * 100);

      // 2) overall earliest & latest
      const earliestRes = await client.query(
        `
        SELECT total, date
        FROM investments
        WHERE date IS NOT NULL AND created_by = $1
        ORDER BY date ASC
        LIMIT 1
      `,
        [userId],
      );

      const earliestTotal: number | null = earliestRes.rowCount
        ? parseFloat(earliestRes.rows[0].total)
        : null;

      const earliestDate: Date | null = earliestRes.rowCount
        ? new Date(earliestRes.rows[0].date)
        : null;

      const latestRes = await client.query(
        `
        SELECT total, date
        FROM investments
        WHERE date IS NOT NULL AND created_by = $1
        ORDER BY date DESC
        LIMIT 1
      `,
        [userId],
      );

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
      let currentCagrPercent: number | null = null;

      if (
        earliestTotal !== null &&
        latestTotal !== null &&
        earliestTotal > 0 &&
        earliestDate
      ) {
        const durationDays = daysBetween(earliestDate, utcNow);

        if (durationDays >= 1) {
          const years = durationDays / 365;
          const cagr = Math.pow(latestTotal / earliestTotal, 1 / years) - 1;

          currentCagrPercent = round(cagr * 100);
        }
      }

      const payload: ApiResponse = {
        this_month_amount: round(thisMonthSum),
        last_month_amount: round(lastMonthSum),
        this_month_growth_amount: round(thisMonthGrowthAmount),
        this_month_growth_percent: thisMonthGrowthPercent,
        overall_oldest_total:
          earliestTotal === null ? null : round(earliestTotal),
        overall_latest_total: latestTotal === null ? null : round(latestTotal),
        overall_growth_amount:
          overallGrowthAmount === null ? null : round(overallGrowthAmount),
        overall_growth_percent: overallGrowthPercent,
        duration_days: earliestDate
          ? daysBetween(earliestDate, new Date())
          : undefined,
        current_cagr_percent: currentCagrPercent ?? 0,
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
