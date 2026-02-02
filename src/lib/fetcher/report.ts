import {
  REPORT_AVERAGE_SPENDING_PATH,
  REPORT_AVERAGE_TRANSACTION_PATH,
  REPORT_CASHFLOW_OVERTIME_PATH,
  REPORT_CASHFLOW_PATH,
  REPORT_CATEGORY_RADAR_PATH,
  REPORT_SAVING_RATE_PATH,
  REPORT_SUMMARY_PATH,
  REPORT_TRANSACTION_FREQUENCY_PATH,
  REPORTS_PATH,
} from '@/constant/api/paths';
import { apiFetch } from './api';

// fetch summary
export async function fetchReportSummary(start?: string, end?: string) {
  const searchParams = new URLSearchParams();
  if (start) {
    searchParams.append('startDate', start);
  }
  if (end) {
    searchParams.append('endDate', end);
  }

  const query = searchParams.toString();
  const url = `${REPORT_SUMMARY_PATH}${query ? `?${query}` : ''}`;
  return apiFetch<{
    data?: Array<{ name: string; total: number | null }>;
    error?: string;
  }>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// fetch report data for chart
export async function fetchReport(): Promise<ReportSummaryResponse['data']> {
  try {
    const res = await apiFetch<ReportSummaryResponse>(REPORTS_PATH, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store', // same intent as in your axios.get
      },
    });

    return res.data;
  } catch {
    throw new Error('Failed to fetch summary');
  }
}

export async function fetchCashflow(): Promise<CashflowResponse['data']> {
  const res = await apiFetch<CashflowResponse>(REPORT_CASHFLOW_PATH, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store',
    },
  });
  return res.data;
}

type TransactionFrequencyParams = {
  startDate?: string;
  endDate?: string;
};

export async function fetchTransactionFrequency(
  params: TransactionFrequencyParams = {},
): Promise<TransactionFrequencyResponse['data']> {
  const searchParams = new URLSearchParams();
  if (params.startDate) {
    searchParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.append('endDate', params.endDate);
  }

  const query = searchParams.toString();
  const url = `${REPORT_TRANSACTION_FREQUENCY_PATH}${query ? `?${query}` : ''}`;

  const res = await apiFetch<TransactionFrequencyResponse>(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store',
    },
  });

  return res.data;
}

export async function fetchSavingRate(): Promise<SavingRateResponse['data']> {
  const res = await apiFetch<SavingRateResponse>(REPORT_SAVING_RATE_PATH, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store',
    },
  });
  return res.data ?? [];
}

export async function fetchAverageTransactionPerDays(): Promise<
  AverageTransactionResponse['data']
> {
  const res = await apiFetch<AverageTransactionResponse>(
    REPORT_AVERAGE_TRANSACTION_PATH,
    {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
  return res.data ?? [];
}

export async function fetchCashflowOvertime(): Promise<
  CashflowOvertimeResponse['data']
> {
  const res = await apiFetch<CashflowOvertimeResponse>(
    REPORT_CASHFLOW_OVERTIME_PATH,
    {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
  return res.data ?? [];
}

const reportApi = {
  fetchReportSummary,
  fetchReport,
  fetchCashflow,
  fetchTransactionFrequency,
  fetchSavingRate,
  fetchCashflowOvertime,
  fetchAverageSpending,
};

export default reportApi;

export type AverageSpendingResponse = {
  daily: { value: number; previous: number };
  weekly: { value: number; previous: number };
  monthly: { value: number; previous: number };
};

export async function fetchAverageSpending(): Promise<AverageSpendingResponse> {
  const res = await apiFetch<{ data: AverageSpendingResponse }>(
    REPORT_AVERAGE_SPENDING_PATH,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store' },
    },
  );
  return res.data;
}

export type CategoryRadarRow = { category: string; total: number };

export async function fetchTransactionCategoryRadar(
  params: TransactionFrequencyParams,
): Promise<CategoryRadarRow[]> {
  const searchParams = new URLSearchParams();
  if (params.startDate) {
    searchParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.append('endDate', params.endDate);
  }

  const query = searchParams.toString();
  const url = `${REPORT_CATEGORY_RADAR_PATH}${query ? `?${query}` : ''}`;
  const res = await apiFetch<{ data: CategoryRadarRow[] }>(url, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  });
  return res.data;
}
