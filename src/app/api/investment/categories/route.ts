import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description FROM investment_categories ORDER BY id ASC',
    );
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('investment categories error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_categories' },
      { status: 500 },
    );
  }
}
