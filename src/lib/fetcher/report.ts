import { apiFetch } from "./api";

// fetch summary
export async function fetchReportSummary() {
    return apiFetch<{ data?: Array<{ name: string; total: number | null }>; error?: string }>(
        "/api/report/summary",
        {
            method: "GET",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
    );
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

export default { fetchReportSummary, fetchReport };