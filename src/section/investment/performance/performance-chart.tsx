'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  fetchInvestmentInvestedPerformance,
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
import Footer from '@/components/layout/footer';
import AssetGoalLevelChart from './asset-goal-level-chart-bar';

const chartConfig = {
  total: { label: 'Total Assets', color: 'var(--chart-8)' },
  invested: { label: 'Invested Capital', color: '#2563eb' },
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

  const { data: investedData = [], isLoading: isLoadingInvested } = useQuery<
    Performance[]
  >({
    queryKey: qk.investments.investedPerformance,
    queryFn: fetchInvestmentInvestedPerformance,
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
    // Map performance data by date
    const performanceMap = new Map<string, { total: number }>();
    (Array.isArray(data) ? data : []).forEach((r) => {
      performanceMap.set(r.date, { total: Number(r.total ?? 0) });
    });

    // Map invested data by date
    const investedMap = new Map<string, { invested_total: number }>();
    (Array.isArray(investedData) ? investedData : []).forEach((r) => {
      investedMap.set(r.date, {
        invested_total: Number((r as any).invested_total ?? 0),
      });
    });

    // Get all unique dates from both datasets
    const allDates = new Set<string>([
      ...Array.from(performanceMap.keys()),
      ...Array.from(investedMap.keys()),
    ]);

    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort();

    // Merge data and forward-fill missing values
    let lastTotal = 0;
    let lastInvested = 0;

    const rows = sortedDates.map((date) => {
      const perfData = performanceMap.get(date);
      const investedData = investedMap.get(date);

      // Use current value if exists, otherwise use last known value (forward-fill)
      if (perfData) lastTotal = perfData.total;
      if (investedData) lastInvested = investedData.invested_total;

      return {
        date,
        total: lastTotal,
        invested: lastInvested,
      };
    });

    return rows;
  }, [data, investedData]);

  const currentValue = React.useMemo(() => {
    if (levelData?.current_value !== undefined) {
      return Number(levelData.current_value);
    }
    return performance.reduce((prev, item) => prev + item.total, 0);
  }, [levelData, performance]);

  const items = React.useMemo(() => {
    if (!cardsData?.data) return [] as Array<MetricItem>;

    const {
      total_invested_capital = 0,
      current_equity = 0,
      net_profit = 0,
      real_return_percent = 0,
      annualized_return_percent = 0,
    } = cardsData.data;

    return [
      {
        title: 'Current Equity',
        value: formatCurrency(current_equity, currency),
      },
      {
        title: 'Total Invested',
        value: formatCurrency(total_invested_capital, currency),
      },
      {
        title: 'Net Profit',
        value: formatCurrency(net_profit, currency),
        percentChange: real_return_percent,
      },
      {
        title: 'Return Rate',
        value: real_return_percent.toFixed(2) + '%',
      },
      {
        title: 'Annualized Return (XIRR)',
        value: annualized_return_percent.toFixed(2) + '%',
      },
    ] satisfies Array<MetricItem>;
  }, [currency, cardsData]);

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
                  <linearGradient id="fillInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-invested)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-invested)"
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
                  dataKey="invested"
                  type="natural"
                  fill="url(#fillInvested)"
                  stroke="var(--color-invested)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="total"
                  type="natural"
                  fill="url(#fillTotal)"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <AssetGoalLevelChart
          levelRows={levelRows}
          currentLevelInfo={currentLevelInfo}
          isLoadingLevels={isLoadingLevels}
          currency={currency}
          levelsError={levelsError}
          currentValue={currentValue}
        />
      </div>
      <Footer />
    </div>
  );
}
