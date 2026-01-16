'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/utils/currency';
import { CHART_VARS } from '@/constant/chart-color';
import { fetchReportSummary } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { useUiStore } from '@/store/ui';

import { Skeleton } from '../../components/ui/skeleton';
import CalenderFilter, {
  createDefaultRange,
  toParam,
} from '@/components/common/calender-filter';
import { DateRange } from 'react-day-picker';
import { formatDate } from '@/utils/formatter';
type ApiRow = { name: string; total: number }; // matches API aliases

export function ChartPieLegend() {
  const currency = useUiStore((state) => state.currency);
  const [selectedRange, setSelectedRange] =
    useState<DateRange>(createDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() =>
    createDefaultRange(),
  );
  const startDateParam = toParam(appliedRange.from, 'start');
  const endDateParam = toParam(appliedRange.to, 'end');

  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.categorySummary(startDateParam, endDateParam),
    queryFn: async () => {
      const res = await fetchReportSummary(startDateParam, endDateParam);
      const rows = (res?.data ?? []).map((r: any) => ({
        name: String(r.name ?? '-'),
        total: Number(r.total ?? 0),
      })) as ApiRow[];
      return rows;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const rows = Array.isArray(data) ? data : [];

  const rowsWithTransactions = useMemo(
    () => rows.filter((r) => Number(r.total ?? 0) > 0),
    [rows],
  );

  // Build chart data & config dynamically
  const chartData = useMemo(() => {
    if (!Array.isArray(rowsWithTransactions)) return [];
    return rowsWithTransactions.map((r, i) => ({
      // recharts props expected by your legend/content
      category: r.name, // legend label key
      amount: Number(r.total ?? 0), // used by <Pie dataKey="amount" />
      original: Number(r.total ?? 0), // preserve real value for tooltips/labels
      fill: CHART_VARS[i % CHART_VARS.length],
    }));
  }, [rowsWithTransactions]);

  const chartConfig: ChartConfig = useMemo(() => {
    const base: any = { amount: { label: 'Amount' } };
    rowsWithTransactions.forEach((r, i) => {
      base[r.name] = {
        label: r.name,
        color: CHART_VARS[i % CHART_VARS.length],
      };
    });
    return base;
  }, [rowsWithTransactions]);

  if (isLoading) {
    return (
      <div className="px-8 py-2 ">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Expenses Summary</CardTitle>
          </CardHeader>
          <Skeleton className="h-60 w-275 px-5 animate-pulse" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses Summary</CardTitle>
        </CardHeader>
        <CardContent className="pb-6 text-sm text-red-600">
          Failed to load data: {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  const hasChartData = chartData.length > 0;

  return (
    <div className="px-8 py-2 ">
      <Card
        className="flex flex-col border border-muted-foreground/20
    backdrop-blur
    bg-gradient-to-t
    from-gray-200/80
    via-gray-100/60
    to-gray-100/30
    dark:from-gray-800/80
    dark:via-gray-800/50
    dark:to-gray-900/20"
      >
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle className="my-1">Expenses Summary</CardTitle>
            <CardDescription className="my-1">
              Transaction from
              <b>
                {' '}
                {formatDate(selectedRange?.from!.toString(), {
                  withTime: false,
                })}
              </b>{' '} 
              to 
              <b>
                 {' '}
                {formatDate(appliedRange.to!.toString(), {
                  withTime: false,
                })}{' '}
              </b>
              period
            </CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 mr-5 mb-4">
            <CalenderFilter
              range={selectedRange}
              onChange={(r) => setSelectedRange(r!)}
              onApply={(r) => {
                if (r) setAppliedRange(r);
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          {hasChartData ? (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[500px]"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  label
                  nameKey="category"
                  // optional: innerRadius for donut style
                  innerRadius={20}
                  // outerRadius={100}
                  isAnimationActive
                />
                <ChartLegend
                  content={
                    <ChartLegendContent nameKey="category" payload={{}} />
                  }
                  className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-start"
                />

                <RechartsTooltip
                  // Show the original amount in tooltip, not the minimal slice value
                  formatter={(value: number, _name: string, item: any) => [
                    formatCurrency(
                      Number(item?.payload?.original ?? value),
                      currency,
                    ),
                    'Amount',
                  ]}
                  // label is the slice label if provided via nameKey
                  labelFormatter={(label: string) => String(label)}
                  wrapperStyle={{ outline: 'clip' }} // optional: remove focus ring box
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
              No category transactions for this range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
