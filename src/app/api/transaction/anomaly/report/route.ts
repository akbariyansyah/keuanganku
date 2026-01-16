import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdfromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const intervalDays = parseInt(searchParams.get('intervalDays') || '70', 10);
    // 1. Fetch anomaly categories
    const anomalyQuery = `
        WITH recent AS (
            SELECT 
                category_id,
                SUM(amount)::INT AS total_recent
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
                r.category_id,
                CASE 
                    WHEN b.avg_baseline > 0 THEN 
                        ROUND(
                            ((r.total_recent - GREATEST(b.avg_baseline, 100000))::DECIMAL 
                            / GREATEST(b.avg_baseline, 100000)) * 100
                        , 2)
                    ELSE 100 END AS deviation_percent
            FROM recent r
            JOIN baseline b ON b.category_id = r.category_id
        )
        SELECT category_id
        FROM anomalies
        WHERE deviation_percent > 30;`;

    const anomalyRes = await pool.query(anomalyQuery, [userId]);
    const anomalyCategories = anomalyRes.rows.map((r) => r.category_id);

    // 2. Fetch all transaction within last 3 month.
    const trxQuery = `
        SELECT 
            id,
            category_id,
            amount,
            created_at
        FROM transactions
        WHERE created_by = $1
          AND created_at >= NOW() - (${intervalDays} * INTERVAL '1 day')
        ORDER BY created_at ASC;
    `;

    const trxRes = await pool.query(trxQuery, [userId]);

    // 3. Mark anomaly
    const result = trxRes.rows.map((t) => ({
      ...t,
      is_anomaly: anomalyCategories.includes(t.category_id),
      amout: Number(t.amount),
    }));

    return NextResponse.json({
      count: result.length,
      anomalies: anomalyCategories.length,
      data: result,
    });
  } catch (err) {
    console.error('anomaly/report error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
