import { Transaction } from "@/types/transaction";
import { apiFetch } from "./api";
import { Pagination } from "@/types/pagination";

export async function createTransaction(payload: CreateTransactionRequest): Promise<{ data?: any; error?: string }> {
    try {
        const res = await apiFetch<{ data: any; error?: string }>("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: payload,
        });
        return { data: res.data };
    } catch (error: any) {
        return { error: error.message || "Failed to create transaction" };
    }
}

export async function updateTransaction(id: string, payload: UpdateTransactionRequest): Promise<{ data?: any; error?: string }> {
    try {
        const res = await apiFetch<{ data: any; error?: string }>(`/api/transaction/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            data: payload,
        });
        return { data: res.data };
    } catch (error: any) {
        return { error: error.message || "Failed to update transaction" };
    }
}

// fetch paginated transactions
export async function fetchTransactions(page = 1, limit = 10): Promise<{ data: Transaction[]; pagination: Pagination }> {
    return apiFetch<{ data: Transaction[]; pagination: Pagination }>(
        `/api/transaction?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
}

// fetch transaction categories
export async function fetchTransactionCategories(): Promise<InvestmentCategoriesResponse["data"]> {
    try {
        const res = await apiFetch<InvestmentCategoriesResponse>("/api/transaction/categories", {
            method: "GET",
            headers: {
                "Cache-Control": "no-store",
            },
        });

        return res.data;
    } catch {
        throw new Error("Failed to fetch categories");
    }
}

export default { createTransaction, updateTransaction, fetchTransactions, fetchTransactionCategories };
