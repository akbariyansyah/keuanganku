import { apiFetch } from "./api";

// fetch summary
export async function fetchReportSummary(interval: number) {
    return apiFetch<{ data?: Array<{ name: string; total: number | null }>; error?: string }>(
        "/api/report/summary?interval=" + interval,
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

export async function fetchCashflow(): Promise<CashflowResponse["data"]> {
    const res = await apiFetch<CashflowResponse>("/api/report/cashflow", {
        method: "GET",
        headers: {
            "Cache-Control": "no-store",
        },
    });
    return res.data;
}

type TransactionFrequencyParams = {
    startDate?: string;
    endDate?: string;
};

export async function fetchTransactionFrequency(
    params: TransactionFrequencyParams = {}
): Promise<TransactionFrequencyResponse["data"]> {
    const searchParams = new URLSearchParams();
    if (params.startDate) {
        searchParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
        searchParams.append("endDate", params.endDate);
    }

    const query = searchParams.toString();
    const url = `/api/report/transaction-frequency${query ? `?${query}` : ""}`;

    const res = await apiFetch<TransactionFrequencyResponse>(url, {
        method: "GET",
        headers: {
            "Cache-Control": "no-store",
        },
    });

    return res.data;
}

export async function fetchSavingRate(): Promise<SavingRateResponse["data"]> {
    const res = await apiFetch<SavingRateResponse>("/api/report/saving-rate", {
        method: "GET",
        headers: {
            "Cache-Control": "no-store",
        },
    });
    return res.data ?? [];
}

const reportApi = { fetchReportSummary, fetchReport, fetchCashflow, fetchTransactionFrequency, fetchSavingRate };

export default reportApi;
