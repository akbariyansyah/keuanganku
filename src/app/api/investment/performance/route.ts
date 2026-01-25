import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { rows } = await pool.query(
      'SELECT id, total::float AS total, date FROM investments WHERE created_by = $1 ORDER BY date ASC',
      [userId],
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('investment performance error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_performance' },
      { status: 500 },
    );
  }
}
