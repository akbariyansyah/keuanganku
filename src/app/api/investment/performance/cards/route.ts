// app/api/investment/performance/cards/route.ts
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import getUserIdfromToken from '@/lib/user-id';
import { sendSuccess, sendError } from '@/lib/api-response';
import { calculateXIRR, prepareCashflows } from '@/utils/xirr';

type CardsPayload = {
  total_invested_capital: number;
  current_equity: number;
  net_profit: number;
  real_return_percent: number;
  annualized_return_percent: number;
};

function round(n: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) {
      return sendError('Unauthorized', 401);
    }

    // 1. Calculate Total Invested Capital
    // Sum all capital injections (type='OUT', category='investment')
    const investedCapitalQuery = `
      SELECT COALESCE(SUM(t.amount), 0)::float AS total_invested
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'OUT'
        AND LOWER(c.name) = 'investment'
        AND t.created_by = $1
    `;

    const investedCapitalRes = await client.query(investedCapitalQuery, [
      userId,
    ]);
    const totalInvestedCapital = parseFloat(
      investedCapitalRes.rows[0]?.total_invested ?? '0',
    );

    // 2. Get Current Equity (latest investment snapshot)
    const currentEquityQuery = `
      SELECT total::float, date
      FROM investments
      WHERE created_by = $1
      ORDER BY date DESC
      LIMIT 1
    `;

    const currentEquityRes = await client.query(currentEquityQuery, [userId]);

    const currentEquity =
      (currentEquityRes?.rowCount ?? 0) > 0
        ? parseFloat(currentEquityRes.rows[0].total)
        : 0;

    const latestDate =
      (currentEquityRes?.rowCount ?? 0) > 0
        ? new Date(currentEquityRes.rows[0].date)
        : new Date();

    // 3. Calculate Net Profit
    const netProfit = currentEquity - totalInvestedCapital;

    // 4. Calculate Real Return Percent
    const realReturnPercent =
      totalInvestedCapital > 0 ? (netProfit / totalInvestedCapital) * 100 : 0;

    // 5. Calculate XIRR (Annualized Return)
    let annualizedReturnPercent = 0;

    // Get all capital injection transactions with dates for XIRR
    const cashflowQuery = `
      SELECT 
        t.amount::float,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'OUT'
        AND LOWER(c.name) = 'investment'
        AND t.created_by = $1
      ORDER BY t.created_at ASC
    `;

    const cashflowRes = await client.query(cashflowQuery, [userId]);

    if ((cashflowRes?.rowCount ?? 0) > 0 && currentEquity > 0) {
      // Prepare capital injections
      const capitalInjections = cashflowRes.rows.map((row) => ({
        date: new Date(row.created_at),
        amount: parseFloat(row.amount),
      }));

      // Prepare cashflows for XIRR
      const cashflows = prepareCashflows(
        capitalInjections,
        currentEquity,
        latestDate,
      );

      // Calculate XIRR
      const xirrRate = calculateXIRR(cashflows);

      if (xirrRate !== null) {
        annualizedReturnPercent = xirrRate * 100; // Convert to percentage
      }
    }

    // 6. Build response
    const payload: CardsPayload = {
      total_invested_capital: round(totalInvestedCapital, 2),
      current_equity: round(currentEquity, 2),
      net_profit: round(netProfit, 2),
      real_return_percent: round(realReturnPercent, 2),
      annualized_return_percent: round(annualizedReturnPercent, 2),
    };

    return sendSuccess(payload);
  } catch (err) {
    console.error('Investment performance cards error:', err);
    return sendError('Failed to fetch investment performance', 500);
  } finally {
    client.release();
  }
}
