
type ReportSummaryResponse = {
    data?: {
        today: { value: number };
        this_week: { value: number };
        this_month: { value: number };
    };
    error?: string;
}