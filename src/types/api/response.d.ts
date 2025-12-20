type ReportSummaryResponse = {
  data?: {
    today: { value: number; previous: number };
    this_week: { value: number; previous: number };
    this_month: { value: number; previous: number };
    total_transaction: { value: number };
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
  data?: TransactionCategoriesResponseItem[];
  error?: string;
};

type UserDetailResponse = {
  data?: { id: string; name: string; email: string; avatar: string };
  error?: string;
};

type InvestmentCardsResponse = {
  data?: {
    this_month_amount: number;
    last_month_amount: number;
    this_month_growth_amount: number;
    this_month_growth_percent: number;
    overall_oldest_total: number;
    overall_latest_total: number;
    overall_growth_amount: number;
    overall_growth_percent: number;
    duration_days: number;
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
