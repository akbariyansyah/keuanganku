'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/currency';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { RecentTransactionChart } from '@/section/dashboard/recent-transaction-chart';
import { RecentActivity } from '@/section/dashboard/recent-activity';
import { ChartPieLegend } from '@/section/dashboard/expenses-summary-chart';
import { fetchCashflow, fetchReport } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';

import MetricCard, { MetricItem } from '@/components/common/metric-card';
import { useUiStore } from '@/store/ui';
import NetBalancePage from './net-balance';
import computePercentChange from '@/utils/matrix';
import { LANGUAGE_MAP } from '@/constant/language';
import { CardSkeleton } from '@/components/common/card-skeleton';
import { AxiosError } from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSectionPage() {
  const currency = useUiStore((state) => state.currency);
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].dashboard.metrics;
  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.kpi,
    queryFn: fetchReport,
    staleTime: 60_000, // cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const {
    data: cashflowData,
    isFetching: isCashflowLoading,
    error: cashflowError,
  } = useQuery({
    queryKey: ['cashflow', currency],
    queryFn: () => fetchCashflow(),
  });

  const items = useMemo(() => {
    if (!data) return [] as Array<MetricItem>;
    const todaySpend = data.today.value;
    const weekSpend = data.this_week.value;
    const monthSpend = data.this_month.value;
    const totalTransaction = data.total_transaction.value;
    const totalIn = data.total_in.value;
    const totalOut = data.total_out.value;
    const additionalParams = {
      total_in: totalIn,
      total_out: totalOut,
    };

    return [
      {
        title: "Today's Spending",
        value: formatCurrency(todaySpend, currency),
        percentChange: computePercentChange(todaySpend, data.today.previous),
        comparisonLabel: 'yesterday',
      },
      {
        title: 'This Week Spending',
        value: formatCurrency(weekSpend, currency),
        percentChange: computePercentChange(weekSpend, data.this_week.previous),
        comparisonLabel: 'last week',
      },
      {
        title: 'This Month Spending',
        value: formatCurrency(monthSpend, currency),
        percentChange: computePercentChange(
          monthSpend,
          data.this_month.previous,
        ),
        comparisonLabel: 'last month',
      },
      {
        title: 'Total transaction',
        value: totalTransaction.toString(),
        additionalParams: additionalParams,
      },
    ] satisfies Array<MetricItem>;
  }, [currency, data]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
        Failed to load dashboard: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <Header />
      {isCashflowLoading ? (
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <Skeleton className="h-100 w-full mb-4" />
        </div>
      ) : (
        <NetBalancePage data={cashflowData} err={cashflowError as AxiosError} />
      )}

      <div className="grid gap-4 lg:grid-cols-4 m-8">
        {isLoading ? (
          <CardSkeleton length={4} />
        ) : (
          items.map((item) => <MetricCard key={item.title} {...item} />)
        )}
      </div>
      {/* <CashflowOvertimePage /> */}
      <div className="flex flex-col lg:flex-row gap-4 px-8">
        <div className="flex-1 min-w-0">
          <RecentTransactionChart />
        </div>
        <div className="w-full lg:w-[400px] lg:flex-shrink-0">
          <RecentActivity />
        </div>
      </div>
      <ChartPieLegend />
      <Footer />
    </div>
  );
}
