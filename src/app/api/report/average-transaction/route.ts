import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
WITH last_7_days AS (
  SELECT
    generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS date
),
daily_out AS (
  SELECT
    DATE(created_at) AS date,
    SUM(amount)::bigint AS sub_total
  FROM transactions
  WHERE type = 'OUT'
    AND created_at >= CURRENT_DATE - INTERVAL '6 days'
  GROUP BY DATE(created_at)
)
SELECT
  d.date::text AS date,
  CASE EXTRACT(DOW FROM d.date)
    WHEN 0 THEN 'Minggu'
    WHEN 1 THEN 'Senin'
    WHEN 2 THEN 'Selasa'
    WHEN 3 THEN 'Rabu'
    WHEN 4 THEN 'Kamis'
    WHEN 5 THEN 'Jumat'
    WHEN 6 THEN 'Sabtu'
  END AS day,
  COALESCE(o.sub_total, 0)::INT AS sub_total
FROM last_7_days d
LEFT JOIN daily_out o ON o.date = d.date
ORDER BY d.date ASC;

    `;

    const { rows } = await pool.query(query);

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching average transaction per days:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
