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
