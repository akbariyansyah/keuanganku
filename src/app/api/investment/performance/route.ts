import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, total::float AS total, date FROM investments ORDER BY date ASC',
    );

    return NextResponse.json(
      { data: rows },
      { status: 200 },
    );
  } catch (err) {
    console.error('investment performance error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_performance' },
      { status: 500 },
    );
  }
}
