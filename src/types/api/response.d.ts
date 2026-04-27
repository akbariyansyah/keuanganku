type ReportSummaryResponse = {
  data?: {
    today: { value: number; previous: number };
    this_week: { value: number; previous: number };
    this_month: { value: number; previous: number };
    total_transaction: { value: number };
    total_in: { value: number };
    total_out: { value: number };
  };
  error?: string;
};

type TransactionHistoryResponse = {
  created_at: string;
  type: string;
  amount: number;
};

type HistorySummaryResponse = {
  data?: TransactionHistoryResponse[];
  metadata?: Record<string, unknown>;
};

type InvestmentCategoriesResponse = {
  data?: { id: number; name: string; description: string }[];
  error?: string;
};

type TransactionCategoriesResponseItem = {
  id: number;
  name: string;
  description: string;
  type: 'IN' | 'OUT';
};

type TransactionCategoriesResponse = {
  data: TransactionCategoriesResponseItem[];
  error?: string;
};

type UserDetailResponse = {
  data?: { id: string; name: string; email: string; avatar: string };
  error?: string;
};

type InvestmentCardsResponse = {
  data?: {
    total_invested_capital: number;
    current_equity: number;
    net_profit: number;
    real_return_percent: number;
    annualized_return_percent: number;
  };
  error?: string;
};

type PortfolioItem = { date: string; name: string; total: string };

type InvestmentPortfolioResponse = {
  data?: PortfolioItem[];
};

type CashflowResponse = {
  data: {
    income: number;
    expenses: number;
    net: number;
  };
  error?: string;
};

type TransactionFrequencyRow = {
  category: string;
  count: number;
};

type TransactionFrequencyResponse = {
  data?: TransactionFrequencyRow[];
  error?: string;
};

type SavingRateRow = {
  month_id: string;
  month_label: string;
  income_total: number;
  saving_total: number;
  saving_rate: number;
};

type SavingRateResponse = {
  data?: SavingRateRow[];
  error?: string;
};

type AverageTransactionPerDayRow = {
  date: string;
  day: string;
  sub_total: number;
};

type AverageTransactionResponse = {
  data?: AverageTransactionPerDayRow[];
  error?: string;
};

type CashflowOvertimeRow = {
  month_id: string;
  month_label: string;
  income_total: number;
  expense_total: number;
  cashflow: number;
};

type CashflowOvertimeResponse = {
  data?: CashflowOvertimeRow[];
  error?: string;
};

type ApiResponse<T> = {
  data: T;
};

type BudgetResponse = {
  id: string;
  user_id: string;
  amount: number;
  periode: string; // ISO date
  created_by: string;
  created_at: string; // ISO timestamp
};

type BudgetAllocationResponse = {
  id: number;
  month: string; // ISO date (YYYY-MM-01)
  category_id: number;
  amount: number;
  created_at: string;
  category_name?: string;
  category_description?: string;
};

type BudgetAllocationsResponse = {
  data?: BudgetAllocationResponse[];
  error?: string;
};

type BudgetCategoryItem = {
  category_id: number;
  category_name: string;
  amount: number;
};

type BudgetComparisonResponse = {
  period: string;
  planned_total: number;
  actual_total: number;
  variance: number;
  variance_percent: string;
  planned_by_category: BudgetCategoryItem[];
  actual_by_category: BudgetCategoryItem[];
};

type CreatePortfolioResponse = {
  message: string;
};
