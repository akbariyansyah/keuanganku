'use client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '@/store/ui';
import { fetchTransactionCategoryRadar } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { formatCurrency } from '@/utils/currency';
import CalenderFilter, {
  createDefaultRange,
  toParam,
} from '@/components/common/calender-filter';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useMemo } from 'react';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  label: {
    color: 'var(--background)',
  },
} satisfies ChartConfig;

export default function TransactionRadar() {
  const currency = useUiStore((state) => state.currency);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => createDefaultRange(),
  );
  const [appliedRange, setAppliedRange] = useState<DateRange>(() =>
    createDefaultRange(),
  );

  const startDateParam = toParam(appliedRange.from, 'start');
  const endDateParam = toParam(appliedRange.to, 'end');

  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.categoryRadar(startDateParam, endDateParam),
    queryFn: () =>
      fetchTransactionCategoryRadar({
        startDate: startDateParam,
        endDate: endDateParam,
      }),
    enabled: Boolean(startDateParam && endDateParam),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    return [
      ...(data || []).map((item, index) => ({
        category: item.category,
        desktop: item.total,
        fill: `var(--chart-${index + 1} )`,
      })),
    ];
  }, [data]);

  const maxValue = Math.max(
    rows.map((item) => item.desktop).reduce((a, b) => Math.max(a, b), 0),
    0,
  );
  return (
    <div>
      <Card className="mx-4 my-6">
        <CardHeader className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Transaction Category Radar 2025</CardTitle>
            <CardDescription className="mt-4">
              Budget allocation per category ·
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
        <CardContent>
          <ChartContainer
            config={chartConfig}
            style={{ height: 360, width: '100%' }}
          >
            <BarChart
              accessibilityLayer
              data={rows}
              // layout="vertical"
              margin={{
                left: 45,
                right: 16,
                top: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={true}
                tickMargin={10}
              />

              <YAxis
                dataKey="desktop"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                width={50}
                domain={[0, (max: number) => max * 1.25]}
              />

              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => {
                      if (typeof value !== 'number' && typeof value != 'string')
                        return value;
                      return formatCurrency(value, currency);
                    }}
                  />
                }
              />

              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2}>
                <LabelList
                  dataKey="desktop"
                  position="top"
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value) => {
                    if (typeof value !== 'number') return '';
                    return formatCurrency(value, currency);
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            The largest value is {formatCurrency(maxValue, currency)}
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total budget allocated to each category.
          </div>
        </CardFooter>
      </Card>{' '}
    </div>
  );
}
