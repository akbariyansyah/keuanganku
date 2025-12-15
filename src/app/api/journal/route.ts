import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const query = `SELECT * from journals`;
    const { rows } = (await pool.query(query)) || [];

    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch journal ${err}` },
      { status: 500 },
    );
  }
}
