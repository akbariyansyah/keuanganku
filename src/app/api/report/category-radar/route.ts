import { NextRequest } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import {
  DEFAULT_RANGE_DAYS,
  toEndOfDay,
  toStartOfDay,
} from '../transaction-frequency/route';
import { sendSuccess, sendError } from '@/lib/api-response';

type CategoryRow = {
  category: string;
  total: number;
};

const FALLBACK_CATEGORY = 'Uncategorized';

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return sendError('Unauthorized', 401);
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
      COALESCE(c.name, $2) AS category,
      COALESCE(SUM(t.amount), 0)::numeric(14,2) AS total
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.created_by = $1 AND t.created_at >= $3
      AND t.created_at <= $4
      AND t.type = 'OUT'
    GROUP BY category
    ORDER BY total DESC;
  `;

  try {
    const { rows } = await pool.query<CategoryRow>(sql, [
      userId,
      FALLBACK_CATEGORY,
      startDate,
      endDate,
    ]);
    return sendSuccess(rows);
  } catch (error) {
    console.error('category radar error:', error);
    return sendError('Failed to fetch category radar', 500);
  }
}
