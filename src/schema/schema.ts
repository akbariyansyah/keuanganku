import z from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const createInvestmentSchema = z.object({
    date: z.string(),
    total: z.number(),
    items: [{
        type: z.string(),
        category_id: z.string(),
        ticker: z.string(),
        value: z.number(),
        valuation: z.number(),
    }]
});

export { loginSchema, createInvestmentSchema };
