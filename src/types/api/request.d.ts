
type CreateInvestmentRequest = {
    total_amount: number;
    date: string;
    items: InvestmentItem[];
}

type InvestmentItem = {
    type: string;
    category_id: number;
    ticker: string;
    valuation: number;
};