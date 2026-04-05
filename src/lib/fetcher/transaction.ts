import { apiFetch } from './api';
import { Transaction, TransactionType } from '@/types/transaction';
import { Anomaly } from '@/section/transaction/anomaly/table-anomaly';
import {
  TRANSACTION_ANOMALY_PATH,
  TRANSACTION_CATEGORIES_PATH,
  TRANSACTION_CATEGORIES_UPDATE_PATH,
  TRANSACTION_HEATMAP_PATH,
  TRANSACTION_PATH,
} from '@/constant/api/paths';

type ApiSuccess<T> = { data: T };
type ApiResult<T> = { data?: T; error?: string };

export type TransactionHeatmapDay = {
  date: string;
  count: number;
  value: number;
};

export type TransactionHeatmap = {
  start_date: string | Date;
  end_date: string | Date;
  days: TransactionHeatmapDay[];
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export async function createTransaction(
  payload: CreateTransactionRequest,
): Promise<ApiResult<Transaction>> {
  try {
    const res = await apiFetch<ApiSuccess<Transaction>>(`${TRANSACTION_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });
    return { data: res.data };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to create transaction') };
  }
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionRequest,
): Promise<ApiResult<Transaction>> {
  try {
    const res = await apiFetch<ApiSuccess<Transaction>>(
      `${TRANSACTION_PATH}/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      },
    );
    return { data: res.data };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to update transaction') };
  }
}

export async function deleteTransaction(id: string): Promise<ApiResult<null>> {
  try {
    const res = await apiFetch<ApiResult<null>>(`${TRANSACTION_PATH}/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to delete transaction') };
  }
}

export async function deleteCategoryTransaction(id: string): Promise<ApiResult<null>> {
  try {
    const res = await apiFetch<ApiResult<null>>(`${TRANSACTION_CATEGORIES_PATH}/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to delete category') };
  }
}

type FetchTransactionsParams = {
  page?: number;
  limit?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string[];
};

import { PaginationMeta } from '@/types/api/api-response';

type FetchTransactionsResponse = {
  data: Transaction[];
  meta: PaginationMeta;
};

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
    params.append('description', description);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  if (type) {
    params.append('type', type);
  }
  if (Array.isArray(categoryId)) {
    categoryId.forEach((id) => params.append('categoryId', id));
  }

  return apiFetch<FetchTransactionsResponse>(
    `${TRANSACTION_PATH}?${params.toString()}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

// fetch transaction categories
export async function fetchTransactionCategories(
  type?: TransactionType,
): Promise<TransactionCategoriesResponse['data']> {
  const query = type
    ? `${TRANSACTION_CATEGORIES_PATH}?type=${type}`
    : TRANSACTION_CATEGORIES_PATH;
  const res = await apiFetch<TransactionCategoriesResponse>(query, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store',
    },
  });

  return res.data;

}

export async function updateTransactionCategories(
  id: string,
  payload: SaveTransactionCategoryRequest,
): Promise<TransactionCategoriesResponse['data']> {
  try {
    const query = `${TRANSACTION_CATEGORIES_UPDATE_PATH.replace(':id', id)}`;
    const res = await apiFetch<TransactionCategoriesResponse>(query, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    return res.data;
  } catch {
    throw new Error('Failed to update category');
  }
}

export async function createTransactionCategories(
  payload: SaveTransactionCategoryRequest,
): Promise<TransactionCategoriesResponse['data']> {
  try {
    const res = await apiFetch<TransactionCategoriesResponse>(TRANSACTION_CATEGORIES_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    return res.data;
  } catch {
    throw new Error('Failed to create category');
  }

}

export async function fetchTransactionHeatmap(
  year?: string | number,
): Promise<TransactionHeatmap> {
  const params = year ? `?year=${year}` : '';
  const res = await apiFetch<{ data: TransactionHeatmap }>(
    `${TRANSACTION_HEATMAP_PATH}${params}`,
    {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );

  return res.data;
}

export async function fetchTransactionAnomaly(): Promise<Anomaly[]> {
  const res = await apiFetch<{ data?: Anomaly[] }>(TRANSACTION_ANOMALY_PATH, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
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
