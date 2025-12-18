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
import { Car } from 'lucide-react';
import { fetchAverageSpending } from '@/lib/fetcher/report';
import { useUiStore } from '@/store/ui';
import { formatCurrency } from '@/utils/currency';

type Week = Array<{ date: Date; count: number }>;
type HeatmapProps = {
  selectedDate: Date | null;
  onSelectDate?: (date: Date | null) => void;
};

const CELL_SIZE = '12px';

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

const normalizeKey = (date: Date) => date.toISOString().slice(0, 10);

const mapColor = (count: number) => {
  if (count === 0) return 'bg-muted border-border/60';
  if (count < 3) return 'bg-blue-900/80 border-blue-900/30';
  if (count < 6) return 'bg-blue-700 border-blue-700/50';
  if (count < 10) return 'bg-blue-500 border-blue-500/50';
  return 'bg-blue-400 border-blue-400/60';
};

const buildWeeks = (
  days: TransactionHeatmapDay[],
  startDate: string,
  endDate: string,
) => {
  const counts = new Map<string, number>();
  days.forEach((day) => {
    const key = normalizeKey(new Date(day.date));
    counts.set(key, day.count);
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
      week.push({ date: current, count: counts.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
};

export default function TransactionHeatmapPage({
  selectedDate,
  onSelectDate,
}: HeatmapProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.transactionHeatmap(),
    queryFn: () => fetchTransactionHeatmap(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const selectedKey = selectedDate ? normalizeKey(selectedDate) : null;

  const weeks = useMemo(() => {
    if (!data) return [] as Week[];
    return buildWeeks(data.days, data.startDate, data.endDate);
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

  const totalTransactions =
    data?.days.reduce((sum, item) => sum + item.count, 0) ?? 0;

  const currency = useUiStore((state) => state.currency);

  const { data: dataAverage } = useQuery({
    queryKey: qk.reports.averageSpending,
    queryFn: fetchAverageSpending,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const yearTabs = ['2025', '2024'];

  const [chartTab, setChartTab] = useState<'2025' | '2024'>('2025');

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
    <div className="px-12 w-full flex justify-between gap-2">
      <Card className="mb-6 w-770px">
        <CardHeader className="pb-3 w-370px">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction heatmap</CardTitle>

              <CardDescription className="mt-4 flex justify-between">
                <div>
                  Each square represents a day — darker squares mean fewer
                  transactions.
                </div>

                <div className="ml-60 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  {[0, 1, 3, 6, 10].map((level) => (
                    <span
                      key={level}
                      className={cn(
                        'h-3 w-3 rounded-sm border',
                        level === 0
                          ? 'bg-muted border-border/60'
                          : mapColor(level),
                      )}
                    />
                  ))}
                  <span>More</span>
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
                <div className="flex-1 overflow-x-auto">
                  {chartTab === '2025' && (
                    <Heatmap
                      weeks={weeks}
                      monthLabels={monthLabels}
                      selectedKey={selectedKey}
                      onSelectDate={onSelectDate}
                    />
                  )}

                  {chartTab === '2024' && (
                    <Heatmap
                      weeks={weeks2026}
                      monthLabels={monthLabels2026}
                      selectedKey={selectedKey}
                      onSelectDate={onSelectDate}
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

      <Card className="p-4 text-sm text-muted-foreground w-full">
        <h3>Total transaction</h3>
        <p>
          <b>{totalTransactions} x</b>
        </p>

        <h3>Average daily spending</h3>
        <p>
          <b>{formatCurrency(dataAverage?.daily.value ?? 0, currency)}</b>
        </p>

        <h3>Average weekly spending</h3>
        <p>
          <b>{formatCurrency(dataAverage?.weekly.value ?? 0, currency)}</b>
        </p>

        <h3>Average monthly spending</h3>
        <p>
          <b>{formatCurrency(dataAverage?.monthly.value ?? 0, currency)}</b>
        </p>
      </Card>
    </div>
  );
}

const Heatmap = ({
  weeks,
  monthLabels,
  selectedKey,
  onSelectDate,
}: {
  weeks: Week[];
  monthLabels: string[];
  selectedKey: string | null;
  onSelectDate?: (date: Date | null) => void;
}) => {
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
                  return (
                    <button
                      key={day.date.toISOString()}
                      type="button"
                      className={cn(
                        'rounded-sm border transition-all duration-150 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer',
                        mapColor(day.count),
                        isSelected && 'ring-2 ring-blue-400 scale-[1.05]',
                      )}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      title={`${dayFormatter.format(day.date)} • ${day.count} transaction${
                        day.count === 1 ? '' : 's'
                      }`}
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
          {Array.from({ length: 25 }).map((_, weekIndex) => (
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
