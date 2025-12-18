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

  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.categoryRadar,
    queryFn: fetchTransactionCategoryRadar,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const finalData = [
    ...(data || []).map((item, index) => ({
      category: item.category,
      desktop: item.total,
      fill: `var(--chart-${index + 1} )`,
    })),
  ];

  const maxValue = Math.max(
    finalData.map((item) => item.desktop).reduce((a, b) => Math.max(a, b), 0),
    0,
  );
  return (
    <Card className="m-10">
      <CardHeader>
        <CardTitle>Transaction Category Radar</CardTitle>
        <CardDescription>2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={finalData}
            // layout="vertical"
            margin={{
              left: 20,
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
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2}>
              <LabelList
                dataKey="desktop"
                position="top"
                className="fill-foreground"
                fontSize={12}
                formatter={(value) => formatCurrency(value, currency)}
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
    </Card>
  );
}
