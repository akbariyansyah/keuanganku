
type ReportSummaryResponse = {
    data?: {
        today: { value: number };
        this_week: { value: number };
        this_month: { value: number };
        total_transaction: { value: number};
    };
    error?: string;
}
type TransactionHistoryResponse = {
    created_at: string;
    amount: number;
}

type HistorySummaryResponse = {
    data?: TransactionHistoryResponse[];
    metadata?: any
}