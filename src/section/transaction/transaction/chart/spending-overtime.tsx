'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/fetcher/api';
import { CHART_VARS } from '@/constant/chart-color';
import { format } from 'path';
import { formatCurrency } from '@/utils/currency';

type ApiResponse = {
  months: string[]; // ['2025-08','2025-09', ...]
  categories: string[]; // ['Food', 'Transport', ...] (optional)
  data: Record<string, Record<string, number>>; // { '2025-08': { 'Food': 123.45, ... }, ... }
};

const chartConfig = {} satisfies ChartConfig;

export default function CategoryMonthlyLinePage() {
  const monthsCount = 12;

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['reports', 'category-monthly', String(monthsCount)],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse>(
        `/api/report/spending-overtime?months=${monthsCount}`,
        {
          method: 'GET',
          headers: { 'Cache-Control': 'no-store' },
        },
      );
      return res;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const months = data?.months ?? [];
  const raw = data?.data ?? {};

  // Derive categories from the data object keys to ensure every series has data.
  // Fallback to data.categories if available.
  const categories = useMemo(() => {
    if (!months.length) return data?.categories ?? [];
    // find first month that exists in raw and use its keys
    const firstMonth = months.find(
      (m) => raw[m] && Object.keys(raw[m]).length > 0,
    );
    if (firstMonth) {
      return Object.keys(raw[firstMonth]).sort();
    }
    // fallback to explicit categories returned by API or empty
    return data?.categories ?? [];
  }, [months, raw, data?.categories]);

  // Build chart data: array of { month: 'YYYY-MM', [categoryName]: number, ... }
  const chartData = useMemo(() => {
    if (!months || !months.length) return [];
    return months.map((mk) => {
      const row: Record<string, any> = { month: mk };
      const monthObj = raw[mk] ?? {};
      for (const cat of categories) {
        // ensure every category exists (0 if missing)
        row[cat] = typeof monthObj[cat] === 'number' ? monthObj[cat] : 0;
      }
      return row;
    });
  }, [months, categories, raw]);

  const categoryColors = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, cat, idx) => {
      acc[cat] = CHART_VARS[idx % CHART_VARS.length];
      return acc;
    }, {});
  }, [categories]);

  let content: React.ReactNode = null;

  if (isLoading && !data) {
    content = <Skeleton className="h-[360px] w-full" />;
  } else if (error) {
    content = (
      <p className="text-sm text-destructive">
        Failed to load category monthly data: {(error as Error).message}
      </p>
    );
  } else if (!chartData.length || !categories.length) {
    content = (
      <p className="text-sm text-muted-foreground">
        No data available for the selected period.
      </p>
    );
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const formatted =
                      typeof value === 'number'
                        ? new Intl.NumberFormat('en-US').format(value)
                        : value;

                    return [
                      <span className="flex items-center gap-2" key={name}>
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: item?.color }}
                        />
                        <span className="font-medium">{name}</span>
                        <span className="ml-auto tabular-nums">
                          {formatted}
                        </span>
                      </span>,
                    ];
                  }}
                />
              }
            />

            <Legend />
            {categories.map((cat, idx) => (
              <Line
                key={cat}
                dataKey={cat}
                name={cat}
                type="monotone"
                stroke={categoryColors[cat]}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeWidth={2}
                connectNulls
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return (
    <div className="px-4 py-2">
      <Card className="my-6">
        <CardHeader className="flex flex-col gap-2 border-b pb-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Category Spending — Last {monthsCount} months</CardTitle>
            <CardDescription>
              Each line shows total spending per category per month.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-6">{content}</CardContent>
      </Card>
    </div>
  );
}
