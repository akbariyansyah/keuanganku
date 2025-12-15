import axios from 'axios';

// login
export async function login(payload: LoginRequest) {
  return apiFetch<{ message: string; user?: any }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });
}

export async function signUp(payload: RegisterRequest) {
  return apiFetch<{ message: string; user?: any }>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });
}

// logout
export async function logout() {
  return apiFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function fetchUserDetail(id: string) {
  const url = `/api/user/${id}`;
  return apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateUser(id: string, payload: UpdateUserRequest) {
  return apiFetch<{ message: string; data: Me }>(`/api/user/${id}`, {
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
      '/api/investment/categories',
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

export async function fetchPortfolio(): Promise<
  InvestmentPortfolioResponse['data']
> {
  try {
    const res = await apiFetch<InvestmentPortfolioResponse>(
      '/api/investment/portfolio',
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

// fetch report histories for line chart
type ReportHistoryRow = { day: string; amount_in: number; amount_out: number };
export async function fetchHistories(
  interval: number,
): Promise<ReportHistoryRow[]> {
  const res = await apiFetch<{ data?: ReportHistoryRow[] }>(
    `/api/report/histories?interval=${interval}`,
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
  return apiFetch<Me>('/api/auth/me', {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  });
}

export type Performance = { id?: string | number; date: string; total: number };
export type PerformanceLevel = { level: number; label: string; goal: number };
export type PerformanceLevelsResponse = {
  currentValue: number;
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
    '/api/investment/performance',
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? [];
}

export async function fetchInvestmentPerformanceLevels(): Promise<PerformanceLevelsResponse> {
  const res = await apiFetch<{ data?: PerformanceLevelsResponse }>(
    '/api/investment/performance/levels',
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data ?? { currentValue: 0, levels: [] };
}

export async function fetchInvestmentPerformanceCards(): Promise<InvestmentCardsResponse> {
  const res = await apiFetch<InvestmentCardsResponse>(
    '/api/investment/performance/cards',
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res;
}

export async function createInvestment(
  request: CreateInvestmentRequest,
): Promise<Success> {
  const res = await apiFetch<Success>('/api/investment/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });
  return res;
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
