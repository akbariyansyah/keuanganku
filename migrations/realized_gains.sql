BEGIN;

-- 1. add status to investment_items
ALTER TABLE investment_items
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused'));

-- 2. realized_gains table
-- investment_item_id → BIGINT (match investment_items.id)
-- transaction_id     → TEXT   (match transactions.id)
-- created_by         → TEXT   (match users.id)
CREATE TABLE
    IF NOT EXISTS realized_gains (
        id BIGSERIAL PRIMARY KEY,
        investment_item_id BIGINT NOT NULL,
        transaction_id TEXT NOT NULL,
        ticker VARCHAR(20) NOT NULL,
        withdrawal_amount NUMERIC(20, 2) NOT NULL,
        cost_basis_portion NUMERIC(20, 2) NOT NULL,
        realized_gain NUMERIC(20, 2) NOT NULL,
        realized_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        created_by TEXT NOT NULL,
        CONSTRAINT fk_rg_investment_item FOREIGN KEY (investment_item_id) REFERENCES investment_items (id) ON DELETE RESTRICT,
        CONSTRAINT fk_rg_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT
    );

-- 3. indexes
CREATE INDEX IF NOT EXISTS idx_realized_gains_user ON realized_gains (created_by, realized_at DESC);

CREATE INDEX IF NOT EXISTS idx_realized_gains_item ON realized_gains (investment_item_id);

-- 4. transactions: add investment_item_id + subtype
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS investment_item_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS subtype VARCHAR(30) NULL CHECK (
    subtype IN ('investment_topup', 'investment_withdrawal')
    OR subtype IS NULL
);

ALTER TABLE transactions ADD CONSTRAINT fk_tx_investment_item FOREIGN KEY (investment_item_id) REFERENCES investment_items (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_investment_item ON transactions (investment_item_id)
WHERE
    investment_item_id IS NOT NULL;

-- 5. add column updated_at 
ALTER TABLE investment_items
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NULL;

COMMIT;