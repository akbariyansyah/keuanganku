import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

type AvgResponse = {
  daily: { value: number; previous: number };
  weekly: { value: number; previous: number };
  monthly: { value: number; previous: number };
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = `
    WITH base AS (
      SELECT (now() AT TIME ZONE 'Asia/Jakarta') AS now_local
    ),
    tx AS (
      SELECT
        amount,
        (created_at AT TIME ZONE 'Asia/Jakarta')::date AS tx_day,
        date_trunc('week', created_at AT TIME ZONE 'Asia/Jakarta')::date AS tx_week,
        date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta')::date AS tx_month
      FROM transactions
      WHERE type = 'OUT' AND created_by = $1
    ),
    current_days AS (
      SELECT gs::date AS day
      FROM base,
        generate_series(
          date_trunc('day', base.now_local) - interval '29 day',
          date_trunc('day', base.now_local),
          interval '1 day'
        ) AS gs
    ),
    previous_days AS (
      SELECT gs::date AS day
      FROM base,
        generate_series(
          date_trunc('day', base.now_local) - interval '59 day',
          date_trunc('day', base.now_local) - interval '30 day',
          interval '1 day'
        ) AS gs
    ),
    current_weeks AS (
      SELECT gs::date AS week_start
      FROM base,
        generate_series(
          date_trunc('week', base.now_local) - interval '11 week',
          date_trunc('week', base.now_local),
          interval '1 week'
        ) AS gs
    ),
    previous_weeks AS (
      SELECT gs::date AS week_start
      FROM base,
        generate_series(
          date_trunc('week', base.now_local) - interval '23 week',
          date_trunc('week', base.now_local) - interval '12 week',
          interval '1 week'
        ) AS gs
    ),
    current_months AS (
      SELECT gs::date AS month_start
      FROM base,
        generate_series(
          date_trunc('month', base.now_local) - interval '11 month',
          date_trunc('month', base.now_local),
          interval '1 month'
        ) AS gs
    ),
    previous_months AS (
      SELECT gs::date AS month_start
      FROM base,
        generate_series(
          date_trunc('month', base.now_local) - interval '23 month',
          date_trunc('month', base.now_local) - interval '12 month',
          interval '1 month'
        ) AS gs
    ),
    day_agg AS (
      SELECT
        (SELECT AVG(total) FROM (
          SELECT d.day, COALESCE(SUM(t.amount), 0) AS total
          FROM current_days d
          LEFT JOIN tx t ON t.tx_day = d.day
          GROUP BY d.day
        ) s) AS avg_current,
        (SELECT AVG(total) FROM (
          SELECT d.day, COALESCE(SUM(t.amount), 0) AS total
          FROM previous_days d
          LEFT JOIN tx t ON t.tx_day = d.day
          GROUP BY d.day
        ) s) AS avg_previous
    ),
    week_agg AS (
      SELECT
        (SELECT AVG(total) FROM (
          SELECT w.week_start, COALESCE(SUM(t.amount), 0) AS total
          FROM current_weeks w
          LEFT JOIN tx t ON t.tx_week = w.week_start
          GROUP BY w.week_start
        ) s) AS avg_current,
        (SELECT AVG(total) FROM (
          SELECT w.week_start, COALESCE(SUM(t.amount), 0) AS total
          FROM previous_weeks w
          LEFT JOIN tx t ON t.tx_week = w.week_start
          GROUP BY w.week_start
        ) s) AS avg_previous
    ),
    month_agg AS (
      SELECT
        (SELECT AVG(total) FROM (
          SELECT m.month_start, COALESCE(SUM(t.amount), 0) AS total
          FROM current_months m
          LEFT JOIN tx t ON t.tx_month = m.month_start
          GROUP BY m.month_start
        ) s) AS avg_current,
        (SELECT AVG(total) FROM (
          SELECT m.month_start, COALESCE(SUM(t.amount), 0) AS total
          FROM previous_months m
          LEFT JOIN tx t ON t.tx_month = m.month_start
          GROUP BY m.month_start
        ) s) AS avg_previous
    )
    SELECT
      (SELECT COALESCE(avg_current, 0) FROM day_agg)   AS daily_current,
      (SELECT COALESCE(avg_previous, 0) FROM day_agg)  AS daily_previous,
      (SELECT COALESCE(avg_current, 0) FROM week_agg)  AS weekly_current,
      (SELECT COALESCE(avg_previous, 0) FROM week_agg) AS weekly_previous,
      (SELECT COALESCE(avg_current, 0) FROM month_agg) AS monthly_current,
      (SELECT COALESCE(avg_previous, 0) FROM month_agg) AS monthly_previous;
  `;

  try {
    const { rows } = await pool.query(sql, [userId]);
    const row = rows[0];

    const response: AvgResponse = {
      daily: {
        value: Number(row.daily_current ?? 0),
        previous: Number(row.daily_previous ?? 0),
      },
      weekly: {
        value: Number(row.weekly_current ?? 0),
        previous: Number(row.weekly_previous ?? 0),
      },
      monthly: {
        value: Number(row.monthly_current ?? 0),
        previous: Number(row.monthly_previous ?? 0),
      },
    };

    return NextResponse.json({ data: response });
  } catch (err) {
    console.error('average spending error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_average_spending' },
      { status: 500 },
    );
  }
}
