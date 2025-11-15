
type ReportSummaryResponse = {
    data?: {
        today: { value: number; previous: number };
        this_week: { value: number; previous: number };
        this_month: { value: number; previous: number };
        total_transaction: { value: number };
    };
    error?: string;
}

type TransactionHistoryResponse = {
    created_at: string;
    type: string;
    amount: number;
}

type HistorySummaryResponse = {
    data?: TransactionHistoryResponse[];
    metadata?: Record<string, unknown>;
}

type InvestmentCategoriesResponse = {
    data?: { id: number; name: string, description: string }[];
    error?: string;
}

type TransactionCategoriesResponseItem = {
    id: number;
    name: string;
    description: string;
    type: "IN" | "OUT";
};

type TransactionCategoriesResponse = {
    data?: TransactionCategoriesResponseItem[];
    error?: string;
}

type UserDetailResponse = {
    data?: { id: string; name: string; email: string; avatar: string };
    error?: string;
}

type PortfolioItem = { date: string, name: string, total: string };

type InvestmentPortfolioResponse = {
    data?: PortfolioItem[];
}

type CashflowResponse = {
    data: {
        income: number;
        expenses: number;
        net: number;
    };
    error?: string;
}

type TransactionFrequencyRow = {
    category: string;
    count: number;
};

type TransactionFrequencyResponse = {
    data?: TransactionFrequencyRow[];
    error?: string;
}
