
type LoginRequest = {
    email:string;
    password:string;
};

type RegisterRequest = {
    email: string;
    username: string;
    telegram_username: string;
    password: string;
    confirm_password: string;
};

type CreateInvestmentRequest = {
    total_amount: number;
    date: string;
    items: InvestmentItem[];
};

type InvestmentItem = {
    type: string;
    category_id: number;
    ticker: string;
    valuation: number;
};