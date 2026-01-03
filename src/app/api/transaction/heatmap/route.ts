import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { endOfDayWIB, formatWIB, startOfDayWIB } from '@/utils/date';

type HeatmapRow = {
  day: Date;
  count: number;
};

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');

  if (!yearParam) {
    return NextResponse.json({ error: 'bad request' }, { status: 403 });
  }

  const parsedYear = Number(yearParam);

  const startDate = startOfDayWIB(new Date(parsedYear, 0, 1));
  const endDate = endOfDayWIB(new Date(parsedYear, 11, 31));
  const sql = `
  SELECT
  date_trunc(
    'day',
    created_at AT TIME ZONE 'Asia/Jakarta'
  )::date AS day,
  COUNT(*)::int AS count
FROM transactions
WHERE created_by = $1
  AND created_at >= $2
  AND created_at <= $3
GROUP BY day
ORDER BY day ASC;

  `;

  try {
    const { rows } = await pool.query<HeatmapRow>(sql, [
      userId,
      startDate,
      endDate,
    ]);

    return NextResponse.json({
      data: {
        startDate: startDate,
        endDate: endDate,
        days: rows.map((row) => ({
          date: formatWIB(row.day),
          count: row.count,
        })),
      },
    });
  } catch (error) {
    console.error('transaction heatmap error:', error);
    return NextResponse.json(
      { error: 'failed_to_fetch_heatmap' },
      { status: 500 },
    );
  }
}
