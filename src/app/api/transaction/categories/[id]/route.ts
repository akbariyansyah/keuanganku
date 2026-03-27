import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

const ALLOWED_TYPES = ['IN', 'OUT'];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return sendError('Category ID is required', 400);
    }

    const { rows } = await pool.query(
      'SELECT id, name, description, transaction_type, created_at, updated_at FROM categories WHERE id = $1',
      [id],
    );

    if (!rows.length) {
      return sendError('Category not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (err) {
    console.error('get category by id error:', err);
    return sendError('Failed to fetch category', 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return sendError('Category ID is required', 400);
    }

    const body = await request.json();
    const name = String(body?.name ?? '').trim();
    const description = body?.description ?? null;
    const categoryType = body?.transaction_type
      ? String(body.transaction_type).toUpperCase()
      : undefined;

    if (!name) {
      return sendError('Name is required', 400);
    }

    if (description !== null && description !== undefined && typeof description !== 'string') {
      return sendError('Description must be a string', 400);
    }

    if (categoryType && !ALLOWED_TYPES.includes(categoryType)) {
      return sendError('Invalid category type', 400);
    }

    const query = `
      UPDATE categories
      SET name = $1,
          description = $2,
          transaction_type = COALESCE($3, transaction_type),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, description, transaction_type, created_at, updated_at
    `;

    const { rows } = await pool.query(query, [name, description, categoryType ?? null, id]);

    if (!rows.length) {
      return sendError('Category not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (err) {
    console.error('update category error:', err);
    return sendError('Failed to update category', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return sendError('Category ID is required', 400);
    }

    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    if (rowCount === 0) {
      return sendError('Category not found', 404);
    }

    return sendSuccess({ message: 'Category deleted' });
  } catch (err) {
    console.error('delete category error:', err);
    return sendError('Failed to delete category', 500);
  }
}
