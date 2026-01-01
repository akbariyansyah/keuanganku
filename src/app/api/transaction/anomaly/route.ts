import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest, NextResponse } from 'next/server';

// % threshold
const THRESHOLD_PERCENT = 30;

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    // Query to find anomalies based on recent transaction sums vs baseline averages
    const query = `
                WITH recent AS (
                SELECT 
                    category_id,
                    SUM(amount)::INT AS total_recent,
                    MAX(created_at) AS last_transaction_at
                FROM transactions
                WHERE created_by = $1
                    AND created_at >= NOW() - INTERVAL '30 days'
                GROUP BY category_id
                ),
                baseline AS (
                SELECT 
                    category_id,
                    AVG(monthly_total)::INT AS avg_baseline
                FROM (
                    SELECT
                    category_id,
                    DATE_TRUNC('month', created_at) AS month_period,
                    SUM(amount) AS monthly_total
                    FROM transactions
                    WHERE created_by = $1
                    AND created_at >= NOW() - INTERVAL '90 days'
                    AND created_at < NOW() - INTERVAL '30 days'
                    GROUP BY category_id, month_period
                ) t
                GROUP BY category_id
                ),
                anomalies AS (
                SELECT 
                    c.id AS category_id,
                    c.name,
                    c.transaction_type,
                    r.total_recent,
                    b.avg_baseline,
                    r.last_transaction_at,
                    CASE 
                    WHEN b.avg_baseline > 0 THEN 
                        ROUND(
                        (
                            (r.total_recent - GREATEST(b.avg_baseline, 100000))::DECIMAL 
                            / GREATEST(b.avg_baseline, 100000)
                        ) * 100
                        , 2)
                    ELSE 100
                    END AS deviation_percent
                FROM recent r
                JOIN baseline b ON b.category_id = r.category_id
                JOIN categories c ON c.id = r.category_id
                )
                SELECT 
                category_id,
                name,
                transaction_type,
                total_recent,
                avg_baseline,
                last_transaction_at,
                deviation_percent,
                CASE 
                    WHEN deviation_percent >= 80 THEN 'high'
                    WHEN deviation_percent >= 50 THEN 'medium'
                    ELSE 'low'
                END AS severity
                FROM anomalies
                WHERE deviation_percent > $2
                ORDER BY deviation_percent DESC;
    `;

    const values = [userId, THRESHOLD_PERCENT];

    const { rows } = await pool.query(query, values);

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('GET anomalies error:', err);
    return NextResponse.json(
      { error: 'failed_to_fetch_anomalies' },
      { status: 500 },
    );
  }
}
