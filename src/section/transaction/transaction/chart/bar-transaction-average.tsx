'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
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
import {
  AverageSpendingResponse,
  fetchAverageTransactionPerDays,
} from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { CHART_VARS } from '@/constant/chart-color';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';
import { formatDate } from '@/utils/formatter';

type AveragePerDaysChartRow = {
  date: string;
  day: string;
  sub_total: number;
  color: string;
};

interface AverageTransactionProps {
  averageTransaction?: AverageSpendingResponse;
}

const chartConfig = {
  sub_total: {
    label: 'Daily Total',
  },
  average: {
    label: 'Average',
  },
} satisfies ChartConfig;

export default function BarTransactionAveragePage({
  averageTransaction,
}: AverageTransactionProps) {
  const currency = useUiStore((state) => state.currency);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.averageTransaction,
    queryFn: fetchAverageTransactionPerDays,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo<AveragePerDaysChartRow[]>(() => {
    return (data ?? []).map((row, index) => ({
      day: row.day,
      date: formatDate(row.date, { withTime: false }),
      sub_total: Number(row.sub_total ?? 0),
      color: CHART_VARS[index % CHART_VARS.length],
    }));
  }, [data]);

  const average = averageTransaction
    ? Number(averageTransaction.daily.value)
    : 0;
  const chartData = rows.map((d) => ({
    ...d,
    average: averageTransaction ? average : 0,
  }));

  let content: React.ReactNode = null;

  if (isLoading && !data) {
    content = <Skeleton className="h-[340px] w-full" />;
  } else if (error) {
    content = (
      <p className="text-sm text-destructive">
        Failed to load average transaction: {(error as Error).message}
      </p>
    );
  } else if (!rows.length) {
    content = (
      <p className="text-sm text-muted-foreground">
        No activity found for the last 7 days.
      </p>
    );
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[360px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 20, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={24}
          />

          <YAxis
            tickFormatter={(value) => formatCurrency(value, currency)}
            axisLine={false}
            domain={[0, (max: number) => max * 1.25]}
            tickLine={false}
          />

          {/* <Line
            type="natural"
            dataKey="average"
            stroke="#2563eb" // blue-600
            strokeWidth={2.5}
            opacity={1}
            strokeDasharray="6 6"
            dot={false}
          /> */}

          <ReferenceLine
            y={average}
            stroke="#2563eb"
            strokeWidth={2}
            strokeDasharray="6 6"
            ifOverflow="extendDomain"
            label={{
              value: `Avg ${formatCurrency(average, currency)}`,
              position: 'right',
              fill: '#2563eb',
              fontSize: 12,
            }}
          />

          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  if (!payload?.length) return '';
                  const rawDate = payload[0].payload.date;
                  return rawDate;
                }}
                formatter={(value) => formatCurrency(Number(value), currency)}
              />
            }
          />

          <Bar dataKey="sub_total" radius={6}>
            {rows.map((row) => (
              <Cell key={row.day} fill={row.color} />
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
          <div className="space-y-2">
            <CardTitle>Transaction Average</CardTitle>
            <CardDescription>
              Daily transaction average for the last 7 days.
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Avg Transaction <b>{formatCurrency(average, currency)}</b>
            </p>
          </div>
        </CardHeader>
        <CardContent className="py-6">{content}</CardContent>
      </Card>
    </div>
  );
}
