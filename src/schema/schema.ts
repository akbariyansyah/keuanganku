import z from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const registerSchema = z.object({
    fullname: z.string().min(3, "Full Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters long"),
});

const itemSchema = z.object({
    type: z.string().min(1, "Type is required"),
    category_id: z.number().gt(0, "Please select category"),
    ticker: z.string().min(1, "Ticker is required"),
    valuation: z.number().gt(0, "Valuation must be greater than 0"),
});

const createInvestmentSchema = z.object({
    date: z.string().min(1, "Date is required"),
    created_at: z.string().min(1, "Created date is required"),
    total: z.number(),
    items: z.array(itemSchema).min(1, "At least 1 item"),
});

const baseTransactionSchema = z.object({
    type: z.string().min(1, "Type is required"),
    category_id: z.number().nullish(),
    amount: z.number().gt(0, "Amount must be greater than 0"),
    description: z.string().min(1, "Description is required"),
});

const timestampSchema = z.object({
    created_at: z.date({
        required_error: "Transaction time is required",
    }),
});

const createTransactionSchema = baseTransactionSchema.merge(timestampSchema);
const updateTransactionSchema = baseTransactionSchema.merge(timestampSchema);

export { loginSchema, createTransactionSchema, registerSchema, createInvestmentSchema, updateTransactionSchema };
