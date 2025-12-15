import { pool } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, total::float AS total, date FROM investments ORDER BY date ASC',
    );

    return new Response(JSON.stringify({ data: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('investment performance error:', err);
    return new Response(
      JSON.stringify({ error: 'failed_to_fetch_performance' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
