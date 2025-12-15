'use client';

import { useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSavingRate } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { CHART_VARS } from '@/constant/chart-color';

type SavingRateChartRow = {
  month: string;
  rate: number;
  color: string;
};

const chartConfig = {
  rate: {
    label: 'Saving Rate',
  },
} satisfies ChartConfig;

export default function SavingRatePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.savingRate,
    queryFn: fetchSavingRate,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo<SavingRateChartRow[]>(() => {
    return (data ?? []).map((row, index) => ({
      month: row.month_label,
      rate: Number(row.saving_rate ?? 0),
      color: CHART_VARS[index % CHART_VARS.length],
    }));
  }, [data]);

  const averageRate =
    rows.length === 0
      ? 0
      : rows.reduce((sum, item) => sum + item.rate, 0) / rows.length;
  const latestRate = rows.length === 0 ? 0 : rows[rows.length - 1].rate;

  let content: React.ReactNode = null;

  if (isLoading && !data) {
    content = <Skeleton className="h-[340px] w-full" />;
  } else if (error) {
    content = (
      <p className="text-sm text-destructive">
        Failed to load saving rate: {(error as Error).message}
      </p>
    );
  } else if (!rows.length) {
    content = (
      <p className="text-sm text-muted-foreground">
        No saving activity found for the last 12 months.
      </p>
    );
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[360px] w-full">
        <BarChart
          accessibilityLayer
          data={rows}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => String(value)}
                formatter={(value) => `${Number(value ?? 0).toFixed(1)}%`}
              />
            }
          />
          <Bar dataKey="rate" radius={6}>
            {rows.map((row) => (
              <Cell key={row.month} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <div className="px-8 py-2">
      <Card className="my-6">
        <CardHeader className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Saving Rate</CardTitle>
            <CardDescription>
              Income versus savings · Last 12 months
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Avg Rate
            </p>
            <p className="text-3xl font-semibold">{averageRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">
              Latest month: {latestRate.toFixed(1)}%
            </p>
          </div>
        </CardHeader>
        <CardContent className="py-6">{content}</CardContent>
      </Card>
    </div>
  );
}
