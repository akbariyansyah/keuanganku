import { PoolClient } from 'pg';

export interface InvestmentItemSnapshot {
  id: number;
  ticker: string;
  cost_basis: number;
  quantity: number;
  valuation: number;
  status: string;
}

export async function getLatestInvestmentItem(
  client: PoolClient,
  investmentItemId: number,
  userId: string
): Promise<InvestmentItemSnapshot | null> {
  // ambil row terbaru per ticker milik user
  // karena opsi B — banyak rows per ticker, ambil yang latest
  const { rows } = await client.query<InvestmentItemSnapshot>(
    `SELECT 
      ii.id,
      ii.ticker,
      ii.cost_basis,
      ii.quantity,
      ii.valuation,
      ii.status
    FROM investment_items ii
    INNER JOIN investments i ON i.id = ii.investment_id
    WHERE ii.id = $1
      AND ii.created_by = $2
      AND ii.status = 'active'
    LIMIT 1`,
    [investmentItemId, userId]
  );
  return rows[0] ?? null;
}

export interface AggregatedPosition {
  ticker: string;
  total_cost_basis: number;
  total_quantity: number;
  latest_valuation: number;
}

export async function getAggregatedPosition(
  client: PoolClient,
  ticker: string,
  userId: string
): Promise<AggregatedPosition | null> {
  // SUM semua cost_basis + quantity across semua rows ticker ini
  // karena DCA bisa bikin multiple rows
  const { rows } = await client.query<AggregatedPosition>(
    `SELECT
      ticker,
      SUM(cost_basis)  AS total_cost_basis,
      SUM(quantity)    AS total_quantity,
      -- ambil valuation dari row terbaru
      (
        SELECT valuation 
        FROM investment_items 
        WHERE ticker = $1 
          AND created_by = $2 
          AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      ) AS latest_valuation
    FROM investment_items
    WHERE ticker = $1
      AND created_by = $2
      AND status = 'active'
    GROUP BY ticker`,
    [ticker, userId]
  );
  return rows[0] ?? null;
}