import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, amount, periode, created_by } = body;

        if (!user_id || !amount || !periode || !created_by) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const query = `
      INSERT INTO budgets (user_id, amount, periode, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, amount, periode, created_by, created_at
    `;

        const values = [user_id, amount, periode, created_by];

        const { rows } = await pool.query(query, values);

        return NextResponse.json(rows[0], { status: 201 });
    } catch (err: any) {
        // unique constraint (user_id + periode)
        if (err.code === '23505') {
            return NextResponse.json(
                { message: 'Budget for this period already exists' },
                { status: 409 }
            );
        }

        console.error(err);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
