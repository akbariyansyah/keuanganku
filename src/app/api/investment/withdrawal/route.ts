import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { sendError, sendSuccess } from '@/lib/api-response';

import { 
  getLatestInvestmentItem, 
  getAggregatedPosition 
} from '@/lib/queries/investments';
import getUserIdfromToken from '@/lib/user-id';

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const userId = await getUserIdfromToken(request);
    if (!userId) return sendError('Unauthorized', 401);

    const body: WithdrawalRequest = await request.json();

    // ── validation ──────────────────────────────────────────
    if (!body.investment_item_id || !body.ticker) {
      return sendError('investment_item_id and ticker are required', 400);
    }
    if (!body.withdrawal_amount || body.withdrawal_amount <= 0) {
      return sendError('withdrawal_amount must be greater than 0', 400);
    }
    if (!body.units_sold || body.units_sold <= 0) {
      return sendError('units_sold must be greater than 0', 400);
    }
    if (!body.category_id) {
      return sendError('category_id is required', 400);
    }

    await client.query('BEGIN');

    // ── 1. fetch current position ────────────────────────────
    const item = await getLatestInvestmentItem(
      client,
      body.investment_item_id,
      userId
    );

    if (!item) {
      await client.query('ROLLBACK');
      return sendError('Investment item not found or already closed', 404);
    }

    // get aggregated position (total across all DCA rows)
    const position = await getAggregatedPosition(client, body.ticker, userId);
    if (!position) {
      await client.query('ROLLBACK');
      return sendError('Could not resolve aggregated position', 404);
    }

    // ── 2. validate units ────────────────────────────────────
    if (body.units_sold > position.total_quantity) {
      await client.query('ROLLBACK');
      return sendError(
        `Cannot sell ${body.units_sold} units — only ${position.total_quantity} available`,
        400
      );
    }

    // ── 3. calculate realized gain ──────────────────────────────
    //
    // proportion = units_sold / total_quantity
    // cost_basis_portion = proportion * total_cost_basis
    // realized_gain = withdrawal_amount - cost_basis_portion
    //
    const proportion = body.units_sold / position.total_quantity;
    const costBasisPortion = proportion * position.total_cost_basis;
    const realizedGain = body.withdrawal_amount - costBasisPortion;
    const returnPercentage = (realizedGain / costBasisPortion) * 100;
    const isFullyClosed = body.units_sold === position.total_quantity;

    // ── 4. insert income transaction ─────────────────────────
    const { rows: txRows } = await client.query<{ id: string }>(
      `INSERT INTO transactions 
        (amount, description, type, subtype, category_id, investment_item_id, created_by, created_at)
       VALUES ($1, $2, 'income', 'investment_withdrawal', $3, $4, $5, $6)
       RETURNING id`,
      [
        body.withdrawal_amount,
        body.description ?? `Withdrawal ${body.ticker}`,
        body.category_id,
        body.investment_item_id,
        userId,
        body.withdrawn_at,
      ]
    );
    const transactionId = txRows[0].id;

    // ── 5. insert realized_gains record ──────────────────────
    const { rows: rgRows } = await client.query<{ id: number }>(
      `INSERT INTO realized_gains
        (investment_item_id, transaction_id, ticker, withdrawal_amount, 
         cost_basis_portion, realized_gain, realized_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        body.investment_item_id,
        transactionId,
        body.ticker,
        body.withdrawal_amount,
        costBasisPortion,
        realizedGain,
        body.withdrawn_at,
        userId,
      ]
    );
    const realizedGainId = rgRows[0].id;

    // ── 6. update investment_items ───────────────────────────
    // decrease cost_basis + quantity proporsional on selected row 
    // if fully closed → update status become 'closed'
    if (isFullyClosed) {
      await client.query(
        `UPDATE investment_items
         SET cost_basis  = 0,
             quantity    = 0,
             status      = 'closed',
             updated_at  = NOW()
         WHERE ticker = $1
           AND created_by = $2
           AND status = 'active'`,
        [body.ticker, userId]
      );
    } else {
      // partial — decrease all active rows proporsional to units sold
      await client.query(
        `UPDATE investment_items
         SET cost_basis = cost_basis * $1,
             quantity   = quantity   * $1,
             updated_at = NOW()
         WHERE ticker = $2
           AND created_by = $3
           AND status = 'active'`,
        [
          1 - proportion,  // sisa proporsi, e.g. jual 30% → kalikan 0.7
          body.ticker,
          userId,
        ]
      );
    }

    await client.query('COMMIT');

    const response: WithdrawalResponse = {
      transaction_id: transactionId,
      realized_gain_id: realizedGainId,
      withdrawal_amount: body.withdrawal_amount,
      cost_basis_portion: Math.round(costBasisPortion),
      realized_gain: Math.round(realizedGain),
      return_percentage: Math.round(returnPercentage * 100) / 100,
      is_fully_closed: isFullyClosed,
    };

    return sendSuccess(response, 'Withdrawal recorded successfully');

  } catch (err: any) {
    await client.query('ROLLBACK');
    return sendError(`Failed to process withdrawal: ${err?.message ?? err}`, 500);
  } finally {
    client.release();
  }
}