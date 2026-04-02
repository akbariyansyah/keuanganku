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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? '').trim();
    const description = body?.description ?? null;
    const categoryType = body?.transaction_type
      ? String(body.transaction_type).toUpperCase()
      : 'OUT';

    if (!name) {
      return sendError('Name is required', 400);
    }

    if (description !== null && typeof description !== 'string') {
      return sendError('Description must be a string', 400);
    }

    if (!ALLOWED_TYPES.includes(categoryType)) {
      return sendError('Invalid category type', 400);
    }

    const query = `
      INSERT INTO categories (name, description, transaction_type)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, transaction_type, created_at, updated_at
    `;

    const { rows } = await pool.query(query, [name, description, categoryType]);

    return sendSuccess(rows[0], 'Category created successfully', 201);
  } catch (err) {
    console.error('create transaction category error:', err);
    return sendError('Failed to create category', 500);
  }
}
