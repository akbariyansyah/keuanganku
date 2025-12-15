import { NextRequest, NextResponse } from 'next/server';

import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

type CategoryRow = {
  category: string;
  total: number;
};

const FALLBACK_CATEGORY = 'Uncategorized';

export async function GET(request: NextRequest) {
  const userId = await getUserIdfromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = `
    SELECT
      COALESCE(c.name, $2) AS category,
      COALESCE(SUM(t.amount), 0)::numeric(14,2) AS total
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.created_by = $1
      AND t.type = 'OUT'
    GROUP BY category
    ORDER BY total DESC;
  `;

  try {
    const { rows } = await pool.query<CategoryRow>(sql, [
      userId,
      FALLBACK_CATEGORY,
    ]);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('category radar error:', error);
    return NextResponse.json(
      { error: 'failed_to_fetch_category_radar' },
      { status: 500 },
    );
  }
}
