'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  fetchInvestmentPerformance,
  fetchInvestmentPerformanceCards,
  fetchInvestmentPerformanceLevels,
  Performance,
  PerformanceLevelsResponse,
} from '@/lib/fetcher/api';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/react-query/keys';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';
import MetricCard, { MetricItem } from '@/components/common/metric-card';
import { CHART_VARS } from '@/constant/chart-color';
import computePercentChange from '@/utils/matrix';

const chartConfig = {
  total: { label: 'Total', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const levelChartConfig = {
  achieved: { label: 'Current value', color: 'var(--chart-1)' },
  remaining: { label: 'To goal', color: 'var(--chart-5)' },
} satisfies ChartConfig;

export default function PerformanceChartPage() {
  const currency = useUiStore((state) => state.currency);
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Performance[]>({
    queryKey: qk.investments.performance,
    queryFn: fetchInvestmentPerformance,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const {
    data: levelData,
    isLoading: isLoadingLevels,
    error: levelsError,
  } = useQuery<PerformanceLevelsResponse>({
    queryKey: qk.investments.performanceLevels,
    queryFn: fetchInvestmentPerformanceLevels,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: cardsData } = useQuery<InvestmentCardsResponse>({
    queryKey: qk.investments.performanceCards,
    queryFn: fetchInvestmentPerformanceCards,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const performance = React.useMemo(() => {
    const rows = (Array.isArray(data) ? data : []).map((r) => ({
      date: r.date,
      total: Number(r.total ?? 0),
    }));

    return rows;
  }, [data]);

  const currentValue = React.useMemo(() => {
    if (levelData?.currentValue !== undefined) {
      return Number(levelData.currentValue);
    }
    return performance.reduce((prev, item) => prev + item.total, 0);
  }, [levelData, performance]);

  const items = React.useMemo(() => {
    if (!cardsData) return [] as Array<MetricItem>;
    const thisMonth =
      cardsData?.data?.this_month_amount !== undefined
        ? cardsData?.data.this_month_amount
        : 0;
    const lastMonth =
      cardsData?.data?.last_month_amount !== undefined
        ? cardsData?.data.last_month_amount
        : 0;
    const thisMonthGrowth =
      cardsData?.data?.this_month_growth_amount !== undefined
        ? cardsData?.data.this_month_growth_amount
        : 0;

    const overallLatest =
      cardsData?.data?.overall_latest_total !== undefined
        ? cardsData?.data.overall_latest_total
        : 0;
    const overallOldest =
      cardsData?.data?.overall_oldest_total !== undefined
        ? cardsData?.data.overall_oldest_total
        : 0;
    const overallGrowth =
      cardsData?.data?.overall_growth_amount !== undefined
        ? cardsData?.data.overall_growth_amount
        : 0;

    const daysElapsed =
      cardsData?.data?.duration_days !== undefined
        ? cardsData?.data.duration_days
        : 0;
    return [
      {
        title: 'Current Assets',
        value: formatCurrency(currentValue, currency),
      },
      {
        title: 'Assets Growth This Month',
        value: formatCurrency(thisMonthGrowth, currency),
        percentChange: computePercentChange(thisMonth, lastMonth),
      },
      {
        title: 'Overall Assets Growth Amount',
        value: formatCurrency(overallGrowth, currency),
        percentChange: computePercentChange(overallLatest, overallOldest),
      },
      {
        title: 'Duration Holding Assets',
        value: daysElapsed.toString() + ' days',
      },
    ] satisfies Array<MetricItem>;
  }, [currency, cardsData, currentValue]);

  const sortedLevels = React.useMemo(
    () => [...(levelData?.levels ?? [])].sort((a, b) => a.goal - b.goal),
    [levelData],
  );

  const currentLevelInfo = React.useMemo(() => {
    if (!sortedLevels.length) return null;
    const nextIndex = sortedLevels.findIndex((l) => currentValue < l.goal);
    const currentIndex =
      nextIndex === -1 ? sortedLevels.length - 1 : Math.max(nextIndex, 0);
    return sortedLevels[currentIndex];
  }, [sortedLevels, currentValue]);

  const levelRows = React.useMemo(() => {
    if (!sortedLevels.length) return [];

    const currentIndex = sortedLevels.findIndex((l) => currentValue < l.goal);
    const lastIndex = sortedLevels.length - 1;
    const cutOffIndex = currentIndex === -1 ? lastIndex : currentIndex;
    const displayLevels = sortedLevels.slice(0, cutOffIndex + 1);

    return displayLevels.map((level, idx) => {
      const achieved = Math.min(currentValue, level.goal);
      const remaining = Math.max(level.goal - achieved, 0);
      const progressPct = level.goal
        ? Math.min((achieved / level.goal) * 100, 100)
        : 0;
      const color = CHART_VARS[idx % CHART_VARS.length];

      return {
        ...level,
        achieved,
        remaining,
        progressPct,
        color,
      };
    });
  }, [sortedLevels, currentValue]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full gap-2 my-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}
      </div>
      <div>
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Performance Asset</CardTitle>
              <CardDescription>
                Showing investment performance over time
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={performance}>
                <defs>
                  <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-total)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-total)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <YAxis
                  width={105}
                  height={40}
                  tickMargin={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(v, currency)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                      formatter={(value) =>
                        formatCurrency(value as number, currency)
                      }
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="total"
                  type="natural"
                  fill="url(#fillTotal)"
                  stroke="var(--color-total)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="pt-0 mt-6">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Asset Goal Levels</CardTitle>
              <CardDescription>
                Current asset value stacked against each level target
              </CardDescription>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-sm font-semibold">
                Current Level: {currentLevelInfo?.label ?? 'N/A'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(currentValue, currency)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {levelsError ? (
              <p className="text-sm text-destructive">
                Failed to load asset goals: {(levelsError as Error).message}
              </p>
            ) : isLoadingLevels ? (
              <p className="text-sm text-muted-foreground">
                Loading asset goals...
              </p>
            ) : !levelRows.length ? (
              <p className="text-sm text-muted-foreground">
                No goal levels available.
              </p>
            ) : (
              <ChartContainer
                config={levelChartConfig}
                className="aspect-auto h-[360px] w-full"
              >
                <BarChart
                  data={levelRows}
                  margin={{ left: 6, right: 6, bottom: 12 }}
                  barSize={42}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => formatCurrency(Number(v), currency)}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          const label =
                            name === 'achieved'
                              ? ' Current value'
                              : ' Remaining to goal';
                          return [
                            formatCurrency(Number(value), currency),
                            label,
                          ];
                        }}
                        labelFormatter={(label, payload) => {
                          const level = payload?.[0]?.payload;
                          const percent = level?.progressPct
                            ? ` (${level.progressPct.toFixed(1)}%)`
                            : '';
                          return `${label}${percent}`;
                        }}
                      />
                    }
                  />
                  <Bar dataKey="achieved" stackId="goal" radius={[4, 4, 0, 0]}>
                    {levelRows.map((entry) => (
                      <Cell
                        key={`achieved-${entry.level}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="remaining" stackId="goal" radius={[4, 4, 0, 0]}>
                    {levelRows.map((entry) => (
                      <Cell
                        key={`remaining-${entry.level}`}
                        fill={entry.color}
                        fillOpacity={0.2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
