'use client';

import MetricCard, { MetricItem } from '@/components/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAverageSpending } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { useUiStore } from '@/store/ui';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/currency';

export default function TransactionAveragePage() {
  const currency = useUiStore((state) => state.currency);

  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.averageSpending,
    queryFn: fetchAverageSpending,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const items: MetricItem[] = data
    ? [
        {
          title: 'Daily average spending',
          value: formatCurrency(data.daily.value, currency),
          //   percentChange: computePercentChange(data.daily.value, data.daily.previous),
          comparisonLabel: 'prev 30 days',
        },
        {
          title: 'Weekly average spending',
          value: formatCurrency(data.weekly.value, currency),
          //   percentChange: computePercentChange(data.weekly.value, data.weekly.previous),
          comparisonLabel: 'prev 12 weeks',
        },
        {
          title: 'Monthly average spending',
          value: formatCurrency(data.monthly.value, currency),
          //   percentChange: computePercentChange(data.monthly.value, data.monthly.previous),
          comparisonLabel: 'prev 12 months',
        },
      ]
    : [];

  return (
    <div className="px-12">
      <Card className="mb-6  w-280">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Average spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load averages: {(error as Error).message}
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <MetricCard key={item.title} {...item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
