import axios from "axios";

// login
export async function login(payload: { email: string; password: string }) {
    return apiFetch<{ message: string; user?: any }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: payload,
    });
}

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

// with apiFetch wrapper
export default async function fetchReport(): Promise<ReportSummaryResponse["data"]> {
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
