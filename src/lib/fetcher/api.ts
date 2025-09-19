import axios from "axios";

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

// fetch summary
export async function fetchReportSummary() {
    return apiFetch("/api/report/summary", {
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

export default { login, logout, fetchReportSummary, fetchReport, fetchCategories, apiFetch };