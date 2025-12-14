import { apiFetch } from "./api";
import { Transaction, TransactionType } from "@/types/transaction";
import { Pagination } from "@/types/pagination";
import { Anomaly } from "@/app/dashboard/anomaly/page";

type ApiSuccess<T> = { data: T };
type ApiResult<T> = { data?: T; error?: string };

export type TransactionHeatmapDay = { date: string; count: number };
export type TransactionHeatmap = {
  startDate: string;
  endDate: string;
  days: TransactionHeatmapDay[];
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export async function createTransaction(
  payload: CreateTransactionRequest
): Promise<ApiResult<Transaction>> {
  try {
    const res = await apiFetch<ApiSuccess<Transaction>>("/api/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: payload,
    });
    return { data: res.data };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, "Failed to create transaction") };
  }
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionRequest
): Promise<ApiResult<Transaction>> {
  try {
    const res = await apiFetch<ApiSuccess<Transaction>>(`/api/transaction/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: payload,
    });
    return { data: res.data };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, "Failed to update transaction") };
  }
}

export async function deleteTransaction(id: string): Promise<ApiResult<null>> {
  try {
    const res = await apiFetch<ApiResult<null>>(`/api/transaction/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: unknown) {
    return { error: getErrorMessage(error, "Failed to delete transaction") };
  }
}

type FetchTransactionsParams = {
  page?: number;
  limit?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: number;
};

type FetchTransactionsResponse = { data: Transaction[]; pagination: Pagination };

// fetch paginated transactions
export async function fetchTransactions({
  page = 1,
  limit = 10,
  description,
  startDate,
  endDate,
  type,
  categoryId,
}: FetchTransactionsParams = {}): Promise<FetchTransactionsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (description) {
    params.append("description", description);
  }
  if (startDate) {
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("endDate", endDate);
  }
  if (type) {
    params.append("type", type);
  }
  if (typeof categoryId === "number") {
    params.append("categoryId", categoryId.toString());
  }

  return apiFetch<FetchTransactionsResponse>(`/api/transaction?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

// fetch transaction categories
export async function fetchTransactionCategories(
  type?: TransactionType
): Promise<TransactionCategoriesResponse["data"]> {
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

export async function fetchTransactionHeatmap(
  year?: string | number
): Promise<TransactionHeatmap> {
  const params = year ? `?year=${year}` : "";
  const res = await apiFetch<{ data: TransactionHeatmap }>(`/api/transaction/heatmap${params}`, {
    method: "GET",
    headers: {
      "Cache-Control": "no-store",
    },
  });

  return res.data;
}

export async function fetchTransactionAnomaly(): Promise<Anomaly[]> {
    const res = await apiFetch<{ data?: Anomaly[] }>("/api/transaction/anomaly", {
        method: "GET",
        headers: { "Cache-Control": "no-store" },
    });
    return res.data ?? [];
}

const transactionApi = {
  createTransaction,
  updateTransaction,
  fetchTransactions,
  fetchTransactionCategories,
  deleteTransaction,
  fetchTransactionHeatmap,
};

export default transactionApi;
