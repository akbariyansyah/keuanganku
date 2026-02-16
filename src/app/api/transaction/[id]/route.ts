import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const { id } = await context.params;
    if (!id) {
      return sendError('Transaction ID is required', 400);
    }

    const body: UpdateTransactionRequest = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeof body.type !== 'undefined') {
      updates.push(`type = $${paramIndex++}`);
      values.push(body.type);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'category_id')) {
      updates.push(`category_id = $${paramIndex++}`);
      values.push(body.category_id ?? null);
    }

    if (typeof body.amount !== 'undefined') {
      updates.push(`amount = $${paramIndex++}`);
      values.push(body.amount);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description ?? null);
    }

    if (typeof body.created_at !== 'undefined') {
      const createdAt = new Date(body.created_at);
      if (Number.isNaN(createdAt.getTime())) {
        return sendError('Invalid transaction time', 400);
      }
      updates.push(`created_at = $${paramIndex++}`);
      values.push(createdAt.toISOString());
    }

    if (updates.length === 0) {
      return sendError('No fields provided for update', 400);
    }

    const idParamIndex = paramIndex++;
    values.push(id);

    const userParamIndex = paramIndex++;
    values.push(userId);

    const query = `
            UPDATE transactions
            SET ${updates.join(', ')}
            WHERE id = $${idParamIndex} AND created_by = $${userParamIndex}
            RETURNING *;
        `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return sendError('Transaction not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (err: any) {
    return sendError(err.message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const { id } = await context.params;
    if (!id) {
      return sendError('Transaction ID is required', 400);
    }

    const query = `DELETE FROM transactions WHERE id = $1`;
    await pool.query(query, [id]);

    return sendSuccess(null);
  } catch (err) {
    return sendError(`Something went wrong: ${err}`, 500);
  }
}
