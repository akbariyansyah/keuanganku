import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type LoginBody = { email?: string; password?: string };

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginBody;

    // basic input checks
    if (!email || !password) {
      return Response.json(
        { error: 'email and password required' },
        { status: 400 },
      );
    }

    // fetch user
    const { rows } = await pool.query<{
      id: string;
      email: string;
      password: string;
    }>(
      'SELECT id, email, password FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );

    const user = rows[0];
    if (!user) {
      return Response.json({ error: 'invalid credentials' }, { status: 401 });
    }

    // compare password with bcrypt hash
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json({ error: 'invalid credentials' }, { status: 401 });
    }

    // sign JWT and set cookie
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return Response.json({ error: 'server misconfigured' }, { status: 500 });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
      expiresIn: '7d',
    });

    const cookiesStore = await cookies();
    cookiesStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // return minimal user data
    return Response.json({ id: user.id, email: user.email }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}
