import getUserIdfromToken from '@/lib/user-id';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export interface OpeningBalance {
  id: string;
  user_id: string;
  period: string; // ISO date
  amount: number;
  created_at: string;
  created_by: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }
    const period = request.nextUrl.searchParams.get('period');
    if (!period) {
      return NextResponse.json(
        { error: 'period is required (YYYY-MM)' },
        { status: 400 },
      );
    }

    const query = `
      SELECT
        id,
        user_id,
        period,
        amount,
        created_at,
        created_by
      FROM opening_balances
      WHERE user_id = $1 AND period = $2
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId, period]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Opening balance not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: rows[0],
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({
      error: `Something went wrong: ${err}`,
    });
  }
}
