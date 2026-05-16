type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  email: string;
  username: string;
  fullname: string;
  password: string;
  confirm_password: string;
};

type CreateInvestmentRequest = {
  total_amount: number;
  date: string;
  created_at: string;
  items: InvestmentItem[];
};

type InvestmentItem = {
  type: string;
  category_id: number;
  ticker: string;
  quantity: number | null;
  cost_basis: number;
  valuation: number;
};

type CreateTransactionRequest = {
  type: string;
  category_id?: number;
  amount: number;
  description?: string;
  created_at?: string;
};

type UpdateTransactionRequest = {
  type?: string;
  category_id?: number | null;
  amount?: number;
  description?: string | null;
  created_at?: string;
};

type SaveTransactionCategoryRequest = {
  name?: string;
  type?: 'IN' | 'OUT';
  description?: string;
};

type UpdateUserRequest = {
  fullname: string;
  username: string;
  email: string;
};

// models/budget.ts
type CreateBudgetRequest = {
  user_id: string;
  amount: number;
  period: string; // 'YYYY-MM-01'
  created_by: string;
};

type BudgetAllocationItem = {
  categoryId: number;
  amount: number;
};

type CreateBudgetAllocationsRequest = {
  month: string; // 'YYYY-MM'
  allocations: BudgetAllocationItem[];
};

type WithdrawalRequest = {
  investment_item_id: number;
  ticker: string;
  withdrawal_amount: number;       // amount of money to be withdrawn from selling units
  units_sold: number;              // total units sold in this withdrawal
  withdrawn_at: string;            // ISO date string
  description?: string;            // optional note, e.g. "Realize profit ADRO"
  category_id: string;             // category for transaction income record, e.g. "Investment Withdrawal"
}

type WithdrawalResponse = {
  transaction_id: string;
  realized_gain_id: number;
  withdrawal_amount: number;
  cost_basis_portion: number;
  realized_gain: number;           // can be negative
  return_percentage: number;
  is_fully_closed: boolean;        // true if units_sold == all remaining units
}