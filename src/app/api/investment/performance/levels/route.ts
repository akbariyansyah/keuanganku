import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { LEVELS } from '@/constant/level';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    const { rows } = await pool.query(
      'SELECT COALESCE(total, 0)::float AS total FROM investments WHERE created_by = $1 ORDER BY date DESC NULLS LAST, id DESC LIMIT 1',
      [userId],
    );
    const currentValue = Number(rows?.[0]?.total ?? 0);

    return NextResponse.json(
      {
        data: {
          currentValue,
          levels: LEVELS,
        },
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('investment performance levels error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_performance_levels' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
