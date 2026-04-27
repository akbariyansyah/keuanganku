import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { pool } from '@/lib/db';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return sendError('Unauthorized', 401);
    }

    // verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!),
    );

    // in payload.sub you usually put userId at login time
    const userId = String(payload.sub);

    // fetch the user from your DB
    const { rows } = await pool.query(
      'SELECT id, email, fullname, username, (SELECT EXISTS (SELECT 1 FROM transactions WHERE created_by = users.id AND type = $1)) AS has_opening_balance FROM users WHERE id = $2',
      ['OB', userId],
    );

    const user = rows[0];
    if (!user) {
      return sendError('User not found', 404);
    }

    return sendSuccess(user);
  } catch (err) {
    console.error('Error in /auth/me', err);
    return sendError('Unauthorized', 401);
  }
}
