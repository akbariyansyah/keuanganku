import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['IN', 'OUT'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');

    let query =
      'SELECT id, name, description, transaction_type FROM categories';
    const values: string[] = [];

    if (typeParam) {
      const normalizedType = typeParam.toUpperCase();
      if (!ALLOWED_TYPES.includes(normalizedType)) {
        return NextResponse.json(
          { error: 'Invalid category type' },
          { status: 400 },
        );
      }
      query += ' WHERE transaction_type = $1';
      values.push(normalizedType);
    }

    query += ' ORDER BY id ASC';

    const { rows } = await pool.query(query, values);
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('transaction categories error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_categories' },
      { status: 500 },
    );
  }
}
