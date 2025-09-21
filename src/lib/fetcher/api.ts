import axios from "axios";
import type { Pagination } from "@/types/pagination";
import type { Transaction } from "@/types/transaction";

// login
export async function login(payload: { email: string; password: string }) {
    return apiFetch<{ message: string; user?: any }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: payload,
    });
}

// logout
export async function logout() {
    return apiFetch<{ message: string }>("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

export async function fetchUserDetail(id: string) {
    const url = `/api/user/${id}`;
    return apiFetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
}

// fetch summary
export async function fetchReportSummary() {
    return apiFetch<{ data?: Array<{ name: string; total: number }>; error?: string }>("/api/report/summary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
}

// fetch report data for chart
export async function fetchReport(): Promise<ReportSummaryResponse["data"]> {
    try {
        const res = await apiFetch<ReportSummaryResponse>("/api/report", {
            method: "GET",
            headers: {
                "Cache-Control": "no-store", // same intent as in your axios.get
            },
        });

        return res.data;
    } catch {
        throw new Error("Failed to fetch summary");
    }
}

export async function fetchCategories(): Promise<InvestmentCategoriesResponse["data"]> {
    try {

        const res = await apiFetch<InvestmentCategoriesResponse>("/api/investment/categories", {
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

// fetch report histories for line chart
type ReportHistoryRow = { day: string; amount_in: number; amount_out: number };
export async function fetchHistories(interval: number | string): Promise<ReportHistoryRow[]> {
    const res = await apiFetch<{ data?: ReportHistoryRow[] }>(
        `/api/report/histories?interval=${interval}`,
        {
            method: "GET",
            headers: { "Cache-Control": "no-store" },
        }
    );
    return res.data ?? [];
}

// fetch current authenticated user
export type Me = {
    id: string;
    email: string;
    fullname: string;
    avatar_url: string;
    username?: string;
};

export async function fetchMe(): Promise<Me> {
    return apiFetch<Me>("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-store" },
    });
}

// fetch paginated transactions
export async function fetchTransactions(page = 1, limit = 10): Promise<{ data: Transaction[]; pagination: Pagination }>
{
    return apiFetch<{ data: Transaction[]; pagination: Pagination }>(
        `/api/transaction?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
}

// generic api fetch wrapper
export async function apiFetch<T = any>(url: string, config?: any): Promise<T> {
    try {
        const res = await axios({
            url,
            ...config,
            headers: {
                Accept: "application/json",
                ...(config?.headers || {}),
            },
        });

        return res.data as T;
    } catch (error: any) {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            window.location.href = "/auth/login";
        }
        throw error;
    }
}

export default { login, logout, fetchReportSummary, fetchReport, fetchCategories, fetchHistories, fetchMe, fetchTransactions, apiFetch };
