'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCashflow } from '@/lib/fetcher/report';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';

export default function NetBalancePage() {
  const currency = useUiStore((state) => state.currency);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cashflow', currency],
    queryFn: fetchCashflow,
  });

  const income = data?.income ?? 0;
  const expenses = data?.expenses ?? 0;
  const net = data?.net ?? 0;

  let content: React.ReactNode = null;
  if (isLoading) {
    content = (
      <p className="text-lg text-muted-foreground">Loading cash flow...</p>
    );
  } else if (error) {
    content = (
      <p className="text-lg text-red-500">
        Failed to load cash flow. {(error as Error).message}
      </p>
    );
  } else {
    content = (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-12">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Income
            </p>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(income, currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Expenses
            </p>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(expenses, currency)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Net Cash Flow
          </p>
          <p
            className={`text-4xl font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {formatCurrency(net, currency)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold">Net Cash Flow (Month-to-Date)</h1>
        {content}
      </div>
    </div>
  );
}
