import { Transaction, TransactionType } from "@/types/transaction";
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

export async function deleteTransaction(id: string): Promise<{ error?: string }> {
    try {
        const res = await apiFetch<{ error?: string }>(`/api/transaction/${id}`, {
            method: "DELETE"
        })
        return res
    } catch (error: any) {
        return { error: error.message };
    }
}

// fetch paginated transactions
export async function fetchTransactions(page = 1, limit = 10, description?: string): Promise<{ data: Transaction[]; pagination: Pagination }> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (description) {
        params.append("description", description);
    }

    return apiFetch<{ data: Transaction[]; pagination: Pagination }>(
        `/api/transaction?${params.toString()}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
}

// fetch transaction categories
export async function fetchTransactionCategories(type?: TransactionType): Promise<TransactionCategoriesResponse["data"]> {
    try {
        const query = type ? `/api/transaction/categories?type=${type}` : "/api/transaction/categories";
        const res = await apiFetch<TransactionCategoriesResponse>(query, {
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

export default { createTransaction, updateTransaction, fetchTransactions, fetchTransactionCategories, deleteTransaction };
