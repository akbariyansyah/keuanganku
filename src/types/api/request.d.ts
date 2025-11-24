
type LoginRequest = {
    email:string;
    password:string;
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

type UpdateUserRequest = {
    fullname: string;
    username: string;
    email: string;
};
