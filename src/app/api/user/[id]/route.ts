import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

// GET /api/user/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // Find user by ID
    const { rows } = await pool.query(
      'SELECT id, email, fullname, username FROM users WHERE id = $1',
      [id],
    );

    if (!rows.length) {
      return sendError('User not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return sendError('Internal server error', 500);
  }
}

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
    if (!id || id !== userId) {
      return sendError('Forbidden', 403);
    }

    const body: UpdateUserRequest = await request.json();
    const { fullname, username, email } = body;

    if (!fullname || !username || !email) {
      return sendError('fullname, username, and email are required', 400);
    }

    const { rows } = await pool.query(
      `UPDATE users
             SET fullname = $1, username = $2, email = $3
             WHERE id = $4
             RETURNING id, email, fullname, username`,
      [fullname, username, email, id],
    );

    if (!rows.length) {
      return sendError('User not found', 404);
    }

    return sendSuccess(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return sendError('Internal server error', 500);
  }
}
