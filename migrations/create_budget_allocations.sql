-- Migration: Create budget_allocations table
-- Description: Stores monthly budget allocations per transaction category
-- Date: 2026-01-18

-- Create budget_allocations table
CREATE TABLE IF NOT EXISTS budget_allocations (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,  -- First day of month (YYYY-MM-01)
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one allocation per category per month
  CONSTRAINT unique_month_category UNIQUE(month, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budget_allocations_month 
  ON budget_allocations(month);

CREATE INDEX IF NOT EXISTS idx_budget_allocations_category 
  ON budget_allocations(category_id);

-- Add comments for documentation
COMMENT ON TABLE budget_allocations IS 'Monthly budget allocations for expense categories';
COMMENT ON COLUMN budget_allocations.month IS 'First day of the budget month (YYYY-MM-01)';
COMMENT ON COLUMN budget_allocations.category_id IS 'Reference to transaction category';
COMMENT ON COLUMN budget_allocations.amount IS 'Budget amount allocated for this category';
