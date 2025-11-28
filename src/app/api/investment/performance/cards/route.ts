// pages/api/assets-growth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "@/lib/db";


type ApiResponse = {
  thisMonthAmount: number;           // this month sum
  lastMonthAmount: number;           // last month sum
  thisMonthGrowthAmount: number;     // thisMonth - lastMonth
  thisMonthGrowthPercent: number | null; // percent, null if not computable
  overallOldestTotal: number | null; // earliest total found
  overallLatestTotal: number | null; // latest total found
  overallGrowthAmount: number | null; // latest - earliest
  overallGrowthPercent: number | null; // percent, null if not computable
};

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export async function GET() {
  try {
    // compute month ranges in UTC
    const now = new Date();
    const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

    // start of this month (UTC)
    const startThisMonth = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1, 0, 0, 0));
    // start of last month
    const startLastMonth = new Date(Date.UTC(startThisMonth.getUTCFullYear(), startThisMonth.getUTCMonth() - 1, 1, 0, 0, 0));
    // end of last month -> one millisecond before startThisMonth (use ISO slicing in query)
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
      const thisMonthSum = parseFloat(sumsRes.rows[0].this_month_sum ?? "0");
      const lastMonthSum = parseFloat(sumsRes.rows[0].last_month_sum ?? "0");
      const thisMonthGrowthAmount = thisMonthSum - lastMonthSum;
      const thisMonthGrowthPercent =
        lastMonthSum === 0 ? null : round((thisMonthGrowthAmount / lastMonthSum) * 100);

      // 2) overall earliest and latest total (we treat earliest/latest by date, returning the 'total' value from those rows)
      const extremesQuery = `
        SELECT total, date FROM investments
        WHERE date IS NOT NULL
        ORDER BY date ASC
        LIMIT 1
      `;
      const earliestRes = await client.query(extremesQuery);
      const earliestTotal: number | null = earliestRes.rowCount ? parseFloat(earliestRes.rows[0].total) : null;

      const latestQuery = `
        SELECT total, date FROM investments
        WHERE date IS NOT NULL
        ORDER BY date DESC
        LIMIT 1
      `;
      const latestRes = await client.query(latestQuery);
      const latestTotal: number | null = latestRes.rowCount ? parseFloat(latestRes.rows[0].total) : null;

      let overallGrowthAmount: number | null = null;
      let overallGrowthPercent: number | null = null;
      if (earliestTotal !== null && latestTotal !== null) {
        overallGrowthAmount = latestTotal - earliestTotal;
        overallGrowthPercent = earliestTotal === 0 ? null : round((overallGrowthAmount / earliestTotal) * 100);
      }

      const payload: ApiResponse = {
        thisMonthAmount: round(thisMonthSum),
        lastMonthAmount: round(lastMonthSum),
        thisMonthGrowthAmount: round(thisMonthGrowthAmount),
        thisMonthGrowthPercent,
        overallOldestTotal: earliestTotal === null ? null : round(earliestTotal),
        overallLatestTotal: latestTotal === null ? null : round(latestTotal),
        overallGrowthAmount: overallGrowthAmount === null ? null : round(overallGrowthAmount),
        overallGrowthPercent,
      };

      return new Response(JSON.stringify({ data: payload }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("assets-growth error:", err);
    return new Response(JSON.stringify({ error: "failed_to_fetch_assets_growth" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}
