import {
  AUTH_LOGIN_PATH,
  AUTH_LOGOUT_PATH,
  AUTH_ME_PATH,
  AUTH_REGISTER_PATH,
  INVESTMENT_CATEGORIES_PATH,
  INVESTMENT_INVESTED_CAPITAL_PATH,
  INVESTMENT_PERFORMANCE_PATH,
  INVESTMENT_PERFORMANCE_MONTHLY_PATH,
  INVESTMENT_PORTFOLIO_PATH,
  REPORT_HISTORIES_PATH,
  USER_PATH,
} from '@/constant/api/paths';
import { SuccessResponse } from '@/types/api/api-response';
import axios from 'axios';

// login
export async function login(payload: LoginRequest): Promise<Me> {
  const res = await apiFetch<SuccessResponse<Me>>(AUTH_LOGIN_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });
  return res.data;
}

export async function signUp(payload: RegisterRequest): Promise<Me> {
  const res = await apiFetch<SuccessResponse<Me>>(AUTH_REGISTER_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });
  return res.data;
}

// logout
export async function logout() {
  return apiFetch<{ message: string }>(AUTH_LOGOUT_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function fetchUserDetail(id: string) {
  const url = `${USER_PATH}/${id}`;
  return apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateUser(
  id: string,
  payload: UpdateUserRequest,
): Promise<{ data: Me }> {
  return apiFetch<SuccessResponse<Me>>(`${USER_PATH}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });
}

export async function fetchCategories(): Promise<
  InvestmentCategoriesResponse['data']
> {
  try {
    const res = await apiFetch<InvestmentCategoriesResponse>(
      `${INVESTMENT_CATEGORIES_PATH}`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );

    return res.data;
  } catch {
    throw new Error('Failed to fetch categories');
  }
}

export async function fetchPortfolio(
  month?: string,
): Promise<InvestmentPortfolioResponse['data']> {
  try {
    const url = month
      ? `${INVESTMENT_PORTFOLIO_PATH}?month=${month}`
      : INVESTMENT_PORTFOLIO_PATH;

    const res = await apiFetch<InvestmentPortfolioResponse>(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    });

    return res.data;
  } catch {
    throw new Error('Failed to fetch portfolio');
  }
}

// fetch report histories for line chart
type ReportHistoryRow = { day: string; amount_in: number; amount_out: number };
export async function fetchHistories(
  interval: number,
): Promise<ReportHistoryRow[]> {
  const res = await apiFetch<{ data?: ReportHistoryRow[] }>(
    `${REPORT_HISTORIES_PATH}?interval=${interval}`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? [];
}

// fetch current authenticated user
export type Me = {
  id: string;
  email: string;
  fullname: string;
  username?: string;
};

export async function fetchMe(): Promise<Me> {
  const res = await apiFetch<SuccessResponse<Me>>(AUTH_ME_PATH, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  });
  return res.data;
}

export type Performance = { id?: string | number; date: string; total: number };
export type MonthlyReturn = { month: string; returnPercent: number };
export type PerformanceLevel = { level: number; label: string; goal: number };
export type PerformanceLevelsResponse = {
  current_value: number;
  levels: PerformanceLevel[];
};
export type Success = { message: string };

// generic api fetch wrapper
export async function apiFetch<T = any>(url: string, config?: any): Promise<T> {
  try {
    const res = await axios({
      url,
      ...config,
      headers: {
        Accept: 'application/json',
        ...(config?.headers || {}),
      },
    });

    return res.data as T;
  } catch (error: any) {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw error;
  }
}

export async function fetchInvestmentPerformance(): Promise<Performance[]> {
  const res = await apiFetch<{ data?: Performance[] }>(
    `${INVESTMENT_PERFORMANCE_PATH}`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? [];
}

export async function fetchInvestmentInvestedPerformance(): Promise<
  Performance[]
> {
  const res = await apiFetch<{ data?: Performance[] }>(
    `${INVESTMENT_INVESTED_CAPITAL_PATH}`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? [];
}

export async function fetchInvestmentPerformanceLevels(): Promise<PerformanceLevelsResponse> {
  const res = await apiFetch<{ data?: PerformanceLevelsResponse }>(
    `${INVESTMENT_PERFORMANCE_PATH}/levels`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  // map snake_case response to camelCase if needed, or update type
  // I updated PerformanceLevelsResponse type above to use snake_case
  return res.data ?? { current_value: 0, levels: [] };
}

export async function fetchInvestmentPerformanceCards(): Promise<InvestmentCardsResponse> {
  const res = await apiFetch<InvestmentCardsResponse>(
    `${INVESTMENT_PERFORMANCE_PATH}/cards`,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res;
}

export async function fetchInvestmentMonthlyReturn(): Promise<MonthlyReturn[]> {
  const res = await apiFetch<{ data?: MonthlyReturn[] }>(
    INVESTMENT_PERFORMANCE_MONTHLY_PATH,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? [];
}

export async function createInvestment(
  request: CreateInvestmentRequest,
): Promise<null> {
  const res = await apiFetch<SuccessResponse<null>>(INVESTMENT_PORTFOLIO_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });
  return res.data;
}
export default {
  login,
  signUp,
  logout,
  fetchCategories,
  fetchHistories,
  fetchMe,
  apiFetch,
  fetchInvestmentPerformance,
  fetchInvestmentPerformanceLevels,
  fetchInvestmentPerformanceCards,
  createInvestment,
};
