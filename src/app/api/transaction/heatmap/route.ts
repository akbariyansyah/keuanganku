import { NextRequest, NextResponse } from "next/server";

import { pool } from "@/lib/db";
import getUserIdfromToken from "@/lib/user-id";

const DAYS_IN_YEAR = 365;

type HeatmapRow = {
  day: Date;
  count: number;
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const getDefaultRange = () => {
  const now = new Date();
  const endDate = endOfDay(now);
  const startDate = startOfDay(new Date(now.getTime() - (DAYS_IN_YEAR - 1) * 24 * 60 * 60 * 1000));
  return { startDate, endDate };
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  let range = getDefaultRange();
  if (yearParam) {
    const parsedYear = Number(yearParam);
    if (!Number.isNaN(parsedYear) && yearParam.length === 4) {
      const startDate = startOfDay(new Date(Date.UTC(parsedYear, 0, 1)));
      const endDate = endOfDay(new Date(Date.UTC(parsedYear, 11, 31)));
      range = { startDate, endDate };
    }
  }

  const { startDate, endDate } = range;

  const sql = `
    SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
    FROM transactions
    WHERE created_by = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY day
    ORDER BY day ASC;
  `;

  try {
    const { rows } = await pool.query<HeatmapRow>(sql, [userId, startDate, endDate]);

    return NextResponse.json({
      data: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: rows.map((row) => ({
          date: row.day.toISOString(),
          count: row.count,
        })),
      },
    });
  } catch (error) {
    console.error("transaction heatmap error:", error);
    return NextResponse.json({ error: "failed_to_fetch_heatmap" }, { status: 500 });
  }
}
