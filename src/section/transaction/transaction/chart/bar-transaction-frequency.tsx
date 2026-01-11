'use client';

import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { fetchTransactionFrequency } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_VARS } from '@/constant/chart-color';
import CalenderFilter, {
  createDefaultRange,
  toParam,
} from '@/components/common/calender-filter';

type FrequencyRow = {
  category: string;
  count: number;
  color: string;
};

const chartConfig = {
  count: {
    label: 'Transactions',
  },
} satisfies ChartConfig;

const formatDisplayDate = (date?: Date) =>
  date
    ? date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

const formatRange = (range?: DateRange) => {
  const fromLabel = formatDisplayDate(range?.from);
  const toLabel = formatDisplayDate(range?.to);

  if (fromLabel && toLabel) {
    return `${fromLabel} - ${toLabel}`;
  }
  if (fromLabel) {
    return `${fromLabel} - Select end date`;
  }
  return 'Select date range';
};

export default function BarTransactionFrequencyPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => createDefaultRange(),
  );
  const [appliedRange, setAppliedRange] = useState<DateRange>(() =>
    createDefaultRange(),
  );

  const startDateParam = toParam(appliedRange.from, 'start');
  const endDateParam = toParam(appliedRange.to, 'end');

  const {
    data: apiData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: qk.reports.transactionFrequency(startDateParam, endDateParam),
    queryFn: () =>
      fetchTransactionFrequency({
        startDate: startDateParam,
        endDate: endDateParam,
      }),
    enabled: Boolean(startDateParam && endDateParam),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(() => {
    if (!apiData) return [] as FrequencyRow[];
    return apiData.map((row, index) => ({
      category: row.category,
      count: Number(row.count ?? 0),
      color: CHART_VARS[index % CHART_VARS.length],
    }));
  }, [apiData]);

  const totalTransactions = rows.reduce((sum, row) => sum + row.count, 0);
  const rangeLabel = formatRange(appliedRange);

  let content: React.ReactNode = null;

  if (isLoading && !apiData) {
    content = <Skeleton className="h-[340px] w-full" />;
  } else if (error) {
    content = (
      <p className="text-sm text-destructive">
        Failed to load transaction frequency: {(error as Error).message}
      </p>
    );
  } else if (!rows.length) {
    content = (
      <p className="text-sm text-muted-foreground">
        No transactions found for this range.
      </p>
    );
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[380px] w-full">
        <BarChart
          accessibilityLayer
          data={rows}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => String(value)}
                formatter={(value) =>
                  `${value} transaction${Number(value) === 1 ? '' : 's'}`
                }
              />
            }
          />
          <Bar dataKey="count" radius={6}>
            {rows.map((row) => (
              <Cell key={row.category} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <div className="px-4 py-2">
      <Card className="my-6">
        <CardHeader className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Transaction Frequency</CardTitle>
            <CardDescription>
              Transactions per category · {rangeLabel}
              {totalTransactions > 0 && (
                <span className="ml-2 font-medium text-foreground">
                  ({totalTransactions} total)
                </span>
              )}
            </CardDescription>
          </div>
          <CalenderFilter
            range={selectedRange}
            onChange={(r) => setSelectedRange(r)}
            onApply={(r) => {
              if (r) setAppliedRange(r);
            }}
          />
        </CardHeader>
        <CardContent className="py-6">
          {isFetching && rows.length > 0 ? (
            <div className="mb-2 text-xs text-muted-foreground">
              Refreshing data…
            </div>
          ) : null}
          {content}
          {rows.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {rows.map((row) => (
                <div key={row.category} className="flex items-center gap-2">
                  <span
                    className="inline-flex h-3 w-3 rounded-sm"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-muted-foreground">{row.category}</span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
