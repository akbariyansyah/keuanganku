"use client";

import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchTransactionCategoryRadar } from "@/lib/fetcher/report";
import { qk } from "@/lib/react-query/keys";
import { formatCurrency } from "@/utils/currency";
import { useUiStore } from "@/store/ui";

const chartConfig = {
  spending: {
    label: "Spending",
    color: "hsl(var(--chart-2, 210 100% 56%))",
  },
};

export default function RadarTransactionChartPage() {
  const currency = useUiStore((state) => state.currency);

  const { data, isLoading, error } = useQuery({
    queryKey: qk.reports.categoryRadar,
    queryFn: fetchTransactionCategoryRadar,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((item) => item.total));
  }, [data]);

  const formattedData = data?.map((item) => ({
    category: item.category,
    total: Math.max(item.total, 0),
  }));

  return (
    <div className="px-12">
      <Card className="mb-6  w-280">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Category radar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load category radar: {(error as Error).message}
            </div>
          ) : !formattedData || formattedData.length === 0 || maxValue === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No spending data available.
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-[4/3] min-h-[280px]"
            >
              <RadarChart data={formattedData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis
                  tickFormatter={(value: number) => formatCurrency(value, currency)}
                  tick={{ fontSize: 11 }}
                  angle={30}
                  domain={[0, maxValue]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value), currency)}
                      labelFormatter={(label) => label}
                    />
                  }
                />
                <Radar
                  name="Spending"
                  dataKey="total"
                  stroke="var(--color-spending)"
                  fill="var(--color-spending)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
