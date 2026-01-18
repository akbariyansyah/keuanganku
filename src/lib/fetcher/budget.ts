import { apiFetch } from './api';

export async function createBudget(
  payload: CreateBudgetRequest,
): Promise<BudgetResponse> {
  const res = await apiFetch<ApiResponse<BudgetResponse>>('/api/budget', {
    method: 'POST',
    body: payload,
  });

  return res.data;
}

export async function createBudgetAllocations(
  payload: CreateBudgetAllocationsRequest,
): Promise<{ message: string; data: BudgetAllocationResponse[] }> {
  const res = await apiFetch<{
    message: string;
    data: BudgetAllocationResponse[];
  }>('/api/budget/allocations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });

  return res;
}

export async function fetchBudgetAllocations(
  month: string,
): Promise<BudgetAllocationResponse[]> {
  const res = await apiFetch<BudgetAllocationsResponse>(
    `/api/budget/allocations?month=${month}`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );

  return res.data || [];
}

export async function fetchTransactionCategories(
  type?: 'in' | 'out',
): Promise<TransactionCategoriesResponseItem[]> {
  const url = type
    ? `/api/transaction/categories?type=${type}`
    : '/api/transaction/categories';

  const res = await apiFetch<TransactionCategoriesResponse>(url, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  });

  return res.data || [];
}

export async function fetchBudgetComparison(
  month: string,
): Promise<BudgetComparisonResponse | null> {
  try {
    const res = await apiFetch<BudgetComparisonResponse>(
      `/api/budget/comparison?month=${month}`,
      {
        method: 'GET',
        headers: { 'Cache-Control': 'no-store' },
      },
    );

    return res;
  } catch (error) {
    console.error('Failed to fetch budget comparison:', error);
    return null;
  }
}

