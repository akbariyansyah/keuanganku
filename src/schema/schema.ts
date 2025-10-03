import z from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const itemSchema = z.object({
    type: z.string().min(1, "Type is required"),
    category_id: z.number().gt(0, "Please select category"),
    ticker: z.string().min(1, "Ticker is required"),
    valuation: z.number().gt(0, "Valuation must be greater than 0"),
});

const createInvestmentSchema = z.object({
    date: z.string().min(1, "Date is required"),
    total: z.number(),
    items: z.array(itemSchema).min(1, "At least 1 item"),
});

export { loginSchema, createInvestmentSchema };
