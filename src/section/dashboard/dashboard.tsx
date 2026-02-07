'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/currency';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { RecentTransactionChart } from '@/section/dashboard/chart';
import { ChartPieLegend } from '@/section/dashboard/expenses-summary-chart';
import { fetchReport } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';

import MetricCard, { MetricItem } from '@/components/common/metric-card';
import { useUiStore } from '@/store/ui';
import NetBalancePage from './net-balance';
import CashflowOvertimePage from './cashflow-overtime';
import computePercentChange from '@/utils/matrix';
import { LANGUAGE_MAP } from '@/constant/language';

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

  const items = useMemo(() => {
    if (!data) return [] as Array<MetricItem>;
    const todaySpend = data.today.value;
    const weekSpend = data.this_week.value;
    const monthSpend = data.this_month.value;
    const totalTransaction = data.total_transaction.value;

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
      },
    ] satisfies Array<MetricItem>;
  }, [currency, data]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="bg-background/60 backdrop-blur border-muted-foreground/20"
          >
            <CardHeader className="pb-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-56 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
      <NetBalancePage />
      <div className="grid gap-4 lg:grid-cols-4 m-8">
        {items.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}
      </div>
      <CashflowOvertimePage />
      <RecentTransactionChart />
      <ChartPieLegend />
      <Footer />
    </div>
  );
}
