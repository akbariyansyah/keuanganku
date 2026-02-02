import {
  BUDGET_ALLOCATIONS_PATH,
  BUDGET_COMPARISON_PATH,
  BUDGET_PATH,
} from '@/constant/api/paths';
import { apiFetch } from './api';

export async function createBudget(
  payload: CreateBudgetRequest,
): Promise<BudgetResponse> {
  const res = await apiFetch<ApiResponse<BudgetResponse>>(`${BUDGET_PATH}`, {
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
  }>(`${BUDGET_ALLOCATIONS_PATH}`, {
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
    `${BUDGET_ALLOCATIONS_PATH}?month=${month}`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );

  return res.data || [];
}

export async function fetchBudgetComparison(
  month: string,
): Promise<BudgetComparisonResponse | null> {
  try {
    const res = await apiFetch<BudgetComparisonResponse>(
      `${BUDGET_COMPARISON_PATH}?month=${month}`,
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
