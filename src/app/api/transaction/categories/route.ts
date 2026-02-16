import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

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
        return sendError('Invalid category type', 400);
      }
      query += ' WHERE transaction_type = $1';
      values.push(normalizedType);
    }

    query += ' ORDER BY id ASC';

    const { rows } = await pool.query(query, values);
    return sendSuccess(rows);
  } catch (err) {
    console.error('transaction categories error:', err);
    return sendError('Failed to fetch categories', 500);
  }
}
