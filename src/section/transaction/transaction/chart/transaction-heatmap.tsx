'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchTransactionHeatmap,
  TransactionHeatmapDay,
} from '@/lib/fetcher/transaction';
import { qk } from '@/lib/react-query/keys';
import { cn } from '@/lib/utils';
import { AverageSpendingResponse } from '@/lib/fetcher/report';
import { useUiStore } from '@/store/ui';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatter';

type Week = Array<{ date: Date; count: number; value: number }>;
type HeatmapProps = {
  selectedDate: Date | null;
  onSelectDate?: (date: Date | null) => void;
  averageSpending?: AverageSpendingResponse;
};

type HeatmapMode = 'count' | 'value';

const CELL_SIZE = '12px';

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

const normalizeKey = (date: Date) => date.toString().slice(0, 10);

// Color mapping for transaction count
const mapColorByCount = (count: number) => {
  if (count === 0) return 'bg-[#ebedf0] border-[#ebedf0]';
  if (count < 3) return 'bg-[#9be9a8] border-[#9be9a8]';
  if (count < 6) return 'bg-[#40c463] border-[#40c463]';
  if (count < 10) return 'bg-[#30a14e] border-[#30a14e]';
  return 'bg-[#216e39] border-[#216e39]';
};

// Color mapping for transaction value (in IDR)
const mapColorByValue = (value: number) => {
  if (value === 0) return 'bg-[#ebedf0] border-[#ebedf0]';
  if (value < 1_000_000) return 'bg-[#9be9a8] border-[#9be9a8]'; // < 1 million
  if (value < 5_000_000) return 'bg-[#40c463] border-[#40c463]'; // < 5 million
  if (value < 10_000_000) return 'bg-[#30a14e] border-[#30a14e]'; // < 10 million
  return 'bg-[#216e39] border-[#216e39]'; // >= 10 million
};

const buildWeeks = (
  days: TransactionHeatmapDay[],
  startDate: string,
  endDate: string,
) => {
  const counts = new Map<string, number>();
  const values = new Map<string, number>();
  days.forEach((day) => {
    const key = normalizeKey(new Date(day.date));
    counts.set(key, day.count);
    values.set(key, day.value);
  });

  const start = new Date(startDate);
  const end = new Date(endDate);

  // align to full weeks (Sun - Sat) to mimic GitHub grid
  const alignedStart = new Date(start);
  alignedStart.setDate(alignedStart.getDate() - alignedStart.getDay());

  const alignedEnd = new Date(end);
  alignedEnd.setDate(alignedEnd.getDate() + (6 - alignedEnd.getDay()));

  const weeks: Week[] = [];
  const cursor = new Date(alignedStart);

  while (cursor <= alignedEnd) {
    const week: Week = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(cursor);
      const key = normalizeKey(current);
      week.push({
        date: current,
        count: counts.get(key) ?? 0,
        value: values.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
};

export default function TransactionHeatmapPage({
  selectedDate,
  onSelectDate,
  averageSpending: dataAverage,
}: HeatmapProps) {
  const yearTabs = ['2026', '2025'];

  const [chartTab, setChartTab] = useState<'2026' | '2025'>('2026');
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('count');

  const { data, isLoading, error } = useQuery({
    queryKey: qk.transactionHeatmap(chartTab),
    queryFn: () => fetchTransactionHeatmap(chartTab),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const selectedKey = selectedDate ? normalizeKey(selectedDate) : null;

  const weeks = useMemo(() => {
    if (!data) return [] as Week[];
    return buildWeeks(
      data.days,
      data.start_date as string,
      data.end_date as string,
    );
  }, [data]);

  const monthLabels = useMemo(() => {
    return weeks.map((week) => {
      const firstDay = week[0];
      if (!firstDay) return '';
      // Only show label on the first week that enters a month
      return firstDay.date.getDate() <= 7
        ? monthFormatter.format(firstDay.date)
        : '';
    });
  }, [weeks]);

  let totalTransactions = 0;
  let transactionIn = 0;
  let transactionOut = 0;

  data?.days.forEach((day) => {
    totalTransactions += day.count;
    if (day.type === 'IN' || day.type === 'OB') {
      transactionIn += day.count;
    } else if (day.type === 'OUT') {
      transactionOut += day.count;
    }
  });

  const options = { withTime: false, variant: 'compact' } as const;
  const period = `${formatDate(data?.days[0].date!, options)} - ${formatDate(data?.days[data.days.length - 1].date!, options)}`;

  const currency = useUiStore((state) => state.currency);

  const weeks2026 = useMemo(() => {
    if (!data) return [] as Week[];
    const days2026 = data.days.filter((day) => day.date.startsWith('2026-'));
    return buildWeeks(days2026, '2026-01-01', '2026-12-31');
  }, [data]);

  const monthLabels2026 = useMemo(() => {
    return weeks2026.map((week) => {
      const firstDay = week[0];
      if (!firstDay) return '';
      // Only show label on the first week that enters a month
      return firstDay.date.getDate() <= 7
        ? monthFormatter.format(firstDay.date)
        : '';
    });
  }, [weeks2026]);
  return (
    <div className="px-4 w-full flex justify-between gap-2">
      <Card>
        <CardHeader className="pb-3 w-370px">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction Activity</CardTitle>

              <CardDescription className="mt-4 flex justify-between">
                <div>
                  Each square represents a day — lighter squares mean{' '}
                  {heatmapMode === 'count'
                    ? 'fewer transactions'
                    : 'lower transaction values'}
                  .
                </div>

                <div className="ml-60 flex items-center gap-3">
                  {/* Toggle button */}
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHeatmapMode('count')}
                      className={cn(
                        'px-3 py-1 text-xs transition-colors',
                        heatmapMode === 'count'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Count
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeatmapMode('value')}
                      className={cn(
                        'px-3 py-1 text-xs transition-colors',
                        heatmapMode === 'value'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Value
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Less</span>
                    {[0, 1, 3, 6, 10].map((level) => (
                      <span
                        key={level}
                        className={cn(
                          'h-3 w-3 rounded-sm border',
                          level === 0
                            ? 'bg-muted border-border/60'
                            : heatmapMode === 'count'
                              ? mapColorByCount(level)
                              : mapColorByValue(level * 1_000_000),
                        )}
                      />
                    ))}
                    <span>More</span>
                  </div>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && <HeatmapSkeleton />}

          {!isLoading && error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load heatmap: {(error as Error).message}
            </div>
          )}

          {!isLoading && !error && weeks.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No transactions recorded in this period.
            </div>
          )}

          {!isLoading && !error && weeks.length > 0 && (
            <>
              <div className="flex gap-4">
                {/* Heatmap */}
                <div className="flex-1">
                  {chartTab === '2025' && (
                    <Heatmap
                      weeks={weeks}
                      monthLabels={monthLabels}
                      selectedKey={selectedKey}
                      onSelectDate={onSelectDate}
                      mode={heatmapMode}
                    />
                  )}

                  {chartTab === '2026' && (
                    <Heatmap
                      weeks={weeks2026}
                      monthLabels={monthLabels2026}
                      selectedKey={selectedKey}
                      onSelectDate={onSelectDate}
                      mode={heatmapMode}
                    />
                  )}
                </div>

                {/* Tabs on the right */}
                <div className="flex flex-col gap-2">
                  {yearTabs.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setChartTab(year as typeof chartTab)}
                      className={cn(
                        'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                        chartTab === year
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="p-6 text-sm text-muted-foreground w-full">
        <div className="flex justify-between align-middle">
          <div>
            <h3>Total transaction : </h3>
            <h3>
              {' '}
              (<b>{period}</b>)
            </h3>
          </div>
          <div className="text-right">
            <p>
              <b>{totalTransactions} x</b>
            </p>
            <p>
              <b>
                {transactionIn} in, {transactionOut} out
              </b>
            </p>
          </div>
        </div>

        <div className="flex justify-between align-middle">
          <h3>Average daily spending : </h3>
          <p>
            <b>{formatCurrency(dataAverage?.daily.value ?? 0, currency)}</b>
          </p>
        </div>

        <div className="flex justify-between align-middle">
          <h3>Average weekly spending : </h3>
          <p>
            <b>{formatCurrency(dataAverage?.weekly.value ?? 0, currency)}</b>
          </p>
        </div>

        <div className="flex justify-between align-middle">
          <h3>Average monthly spending : </h3>
          <p>
            <b>{formatCurrency(dataAverage?.monthly.value ?? 0, currency)}</b>
          </p>
        </div>
      </Card>
    </div>
  );
}

const Heatmap = ({
  weeks,
  monthLabels,
  selectedKey,
  onSelectDate,
  mode,
}: {
  weeks: Week[];
  monthLabels: string[];
  selectedKey: string | null;
  onSelectDate?: (date: Date | null) => void;
  mode: HeatmapMode;
}) => {
  const currency = useUiStore((state) => state.currency);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col justify-between text-[11px] text-muted-foreground leading-3 pt-6">
        <span className="invisible">.</span>
        <span className="mt-1">Mon</span>
        <span className="mt-2.5">Wed</span>
        <span className="mt-2.5">Fri</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-2">
          <div className="flex gap-1 text-[11px] text-muted-foreground">
            {monthLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="h-4 text-center"
                style={{ width: CELL_SIZE }}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  const key = normalizeKey(day.date);
                  const isSelected = selectedKey === key;
                  const colorClass =
                    mode === 'count'
                      ? mapColorByCount(day.count)
                      : mapColorByValue(day.value);

                  const tooltipText =
                    mode === 'count'
                      ? `${dayFormatter.format(day.date)} • ${day.count} transaction${
                          day.count === 1 ? '' : 's'
                        }`
                      : `${dayFormatter.format(day.date)} • ${formatCurrency(day.value, currency)}`;

                  return (
                    <button
                      key={day.date.toString()}
                      type="button"
                      className={cn(
                        'rounded-sm border transition-all duration-150 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer',
                        colorClass,
                        isSelected && 'ring-2 ring-blue-400 scale-[1.05]',
                      )}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      title={tooltipText}
                      onClick={() =>
                        onSelectDate?.(isSelected ? null : day.date)
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeatmapSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col justify-between text-[11px] text-muted-foreground leading-3 pt-6">
        <span className="invisible">.</span>
        <span className="mt-1">Mon</span>
        <span className="mt-2.5">Wed</span>
        <span className="mt-2.5">Fri</span>
      </div>
      <div className="overflow-hidden rounded-lg border bg-muted/20 p-3">
        <div className="flex gap-1">
          {Array.from({ length: 40 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((__, dayIndex) => (
                <Skeleton
                  key={`${weekIndex}-${dayIndex}`}
                  className="h-[14px] w-[14px]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
