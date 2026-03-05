'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/react-query/keys';
import {
  fetchInvestmentMonthlyReturn,
  MonthlyReturn,
} from '@/lib/fetcher/api';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Format "2026-01" → "Jan '26" */
function formatMonth(raw: string): string {
  const [year, month] = raw.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// ─── custom tooltip ──────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const isPositive = value >= 0;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className={isPositive ? 'text-emerald-500' : 'text-rose-500'}>
        {isPositive ? '+' : ''}
        {value.toFixed(2)}%
      </p>
    </div>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

export default function MonthlyReturnChart() {
  const { data = [], isLoading } = useQuery<MonthlyReturn[]>({
    queryKey: qk.investments.monthlyReturn,
    queryFn: fetchInvestmentMonthlyReturn,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const chartData = React.useMemo(
    () =>
      data.map((d) => ({
        month: formatMonth(d.month),
        returnPercent: Number(d.returnPercent),
      })),
    [data],
  );

  const yDomain = React.useMemo(() => {
    if (!chartData.length) return [-10, 10];
    const values = chartData.map((d) => d.returnPercent);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // add 20 % padding so bars don't touch the axis edges
    const pad = Math.max(Math.abs(min), Math.abs(max)) * 0.2 || 2;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  return (
    <Card className="mt-6">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Monthly Return</CardTitle>
          <CardDescription>
            Month-over-month performance excluding cash deposits &amp;
            withdrawals
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No performance data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              {/* Zero baseline */}
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${v}%`}
                domain={yDomain}
                width={50}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.15 }} />

              <Bar dataKey="returnPercent" radius={[3, 3, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    opacity={1}
                    fill={
                      entry.returnPercent >= 0
                        ? 'var(--chart-2)'   // green-ish — positive
                        : 'var(--chart-10)'   // red-ish  — negative
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
