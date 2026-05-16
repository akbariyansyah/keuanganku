import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/api-response';

function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
}

function sanitizeDetail(raw: Partial<AssetDetail>): AssetDetail {
  return {
    ticker: raw.ticker ?? 'Unknown',
    current_value: isValidNumber(raw.current_value) ? raw.current_value : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    // Get optional query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const includeDetail = searchParams.get('include_detail') === 'true';

    // ── Main grouped query (unchanged) ──────────────────────────
    let query = `SELECT
                    (i."date" AT TIME ZONE 'Asia/Jakarta') AS date,
                    ic.name,
                    SUM(ii.valuation) AS total
                    FROM investments i
                    JOIN investment_items ii ON i.id = ii.investment_id
                    JOIN investment_categories ic ON ii.category_id = ic.id
                    WHERE i.created_by = $1`;

    const queryParams: (string | number)[] = [userId];

    // Add month filter if provided
    if (month) {
      const monthPrefix = month.length === 7 ? month : month.substring(0, 7);
      query += ` AND TO_CHAR(date, 'YYYY-MM') = $2`;
      queryParams.push(monthPrefix);
    }

    query += `
                    GROUP BY date, ic.name
                    ORDER BY date DESC`;

    const { rows } = await pool.query(query, queryParams);

    // ── Detail query (only when include_detail=true) ────────────
    let detailMap = new Map<string, AssetDetail[]>();

    if (includeDetail) {
      let detailQuery = `SELECT
                          (i."date" AT TIME ZONE 'Asia/Jakarta') AS date,
                          ic.name AS category_name,
                          ii.ticker,
                          ii.valuation AS current_value
                        FROM investments i
                        JOIN investment_items ii ON i.id = ii.investment_id
                        JOIN investment_categories ic ON ii.category_id = ic.id
                        WHERE i.created_by = $1`;

      const detailParams: (string | number)[] = [userId];

      if (month) {
        const monthPrefix = month.length === 7 ? month : month.substring(0, 7);
        detailQuery += ` AND TO_CHAR(date, 'YYYY-MM') = $2`;
        detailParams.push(monthPrefix);
      }

      detailQuery += ` ORDER BY date DESC, ic.name, ii.ticker`;

      const detailResult = await pool.query(detailQuery, detailParams);

      for (const row of detailResult.rows) {
        const key = `${String(row.date)}|${String(row.category_name)}`;
        const existing = detailMap.get(key) ?? [];
        existing.push(
          sanitizeDetail({
            ticker: row.ticker as string | undefined,
            current_value:
              row.current_value != null ? Number(row.current_value) : null,
          }),
        );
        detailMap.set(key, existing);
      }
    }

    // ── Merge detail into main rows ─────────────────────────────
    const data: PortfolioItem[] = rows.map(
      (row: { date: string; name: string; total: string }) => {
        const key = `${String(row.date)}|${String(row.name)}`;
        return {
          date: row.date,
          name: row.name,
          total: row.total,
          detail: detailMap.get(key) ?? [],
        };
      },
    );

    return sendSuccess(data);
  } catch (err) {
    return sendError(`Failed to fetch portfolio: ${err}`, 500);
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    const body: CreateInvestmentRequest = await request.json();

    await client.query('BEGIN');

    const insertInvestmentQuery = `INSERT INTO investments (date, total, created_by, created_at) VALUES ($1, $2, $3, $4) RETURNING id;`;
    const insertInvestmentArgs = [
      body.date,
      body.total_amount,
      userId,
      body.created_at,
    ];

    const { rows } = await client.query(
      insertInvestmentQuery,
      insertInvestmentArgs,
    );
    const investmentId: number = rows[0].id;

    if (body.items?.length) {
      // 6 columns total → 6 placeholders per row after the shared $1
      const valuesPlaceholders = body.items
        .map((_, i) => {
          const base = i * 6; // 6 dynamic params per item after the shared $1
          return `($1, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
        })
        .join(', ');

      const insertItemQuery = `
            INSERT INTO investment_items (investment_id, asset_type, category_id, ticker, cost_basis, quantity, valuation, created_by, created_at)
            VALUES ${valuesPlaceholders};
      `;

      const insertItemArgs = [
        investmentId,
        ...body.items.flatMap((item) => [
          item.type,
          item.category_id,
          item.ticker,
          item.cost_basis,
          item.quantity,
          item.valuation,
          userId,
          body.created_at,
        ]),
      ];

      await client.query(insertItemQuery, insertItemArgs);
    }

    await client.query('COMMIT');
    return sendSuccess(null, 'Investment created successfully');
  } catch (err: any) {
    await client.query('ROLLBACK');
    return sendError(`Failed to create portfolio: ${err?.message ?? err}`, 500);
  } finally {
    client.release();
  }
}
