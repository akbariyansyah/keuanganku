import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { DEFAULT_RANGE_DAYS } from '@/constant/duration';


const FALLBACK_CATEGORY = 'Uncategorized';

type FrequencyRow = {
  category: string;
  count: number;
};

function toStartOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toEndOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get('startDate');
  const endParam = searchParams.get('endDate');

  const now = new Date();
  const defaultEnd = toEndOfDay(now);
  const defaultStart = toStartOfDay(
    new Date(now.getTime() - (DEFAULT_RANGE_DAYS - 1) * 24 * 60 * 60 * 1000),
  );

  const parsedStart = startParam ? new Date(startParam) : defaultStart;
  const parsedEnd = endParam ? new Date(endParam) : defaultEnd;

  let startDate = Number.isNaN(parsedStart.getTime())
    ? defaultStart
    : parsedStart;
  let endDate = Number.isNaN(parsedEnd.getTime()) ? defaultEnd : parsedEnd;

  startDate = toStartOfDay(startDate);
  endDate = toEndOfDay(endDate);

  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const sql = `
    SELECT
      COALESCE(c.name, $4) AS category,
      COUNT(*)::int AS count
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.created_by = $1
      AND t.created_at >= $2
      AND t.created_at <= $3
    GROUP BY category
    ORDER BY count DESC, category ASC;
  `;

  try {
    const { rows } = await pool.query<FrequencyRow>(sql, [
      userId,
      startDate,
      endDate,
      FALLBACK_CATEGORY,
    ]);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('transaction frequency error:', error);
    return NextResponse.json(
      { error: 'failed_to_fetch_frequency' },
      { status: 500 },
    );
  }
}

export { toStartOfDay, toEndOfDay, DEFAULT_RANGE_DAYS };
