'use client';

import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { fetchTransactionFrequency } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_VARS } from '@/constant/chart-color';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  createDefaultRange,
  dateFilterCalendarClassNames,
  toParam,
} from '@/components/common/calender-filter';

type FrequencyRow = {
  category: string;
  count: number;
  color: string;
};

const chartConfig = {
  count: {
    label: 'Transactions',
  },
} satisfies ChartConfig;

type DateRangeState = {
  start: Date | null;
  end: Date | null;
};

export default function BarTransactionFrequencyPage() {
  const defaultRange = useMemo(() => createDefaultRange(), []);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeState>(
    () => ({
      start: defaultRange.from ?? null,
      end: defaultRange.to ?? null,
    }),
  );
  const [draftDateRange, setDraftDateRange] = useState<DateRangeState>(() => ({
    start: defaultRange.from ?? null,
    end: defaultRange.to ?? null,
  }));

  const handleDateDialogChange = (open: boolean) => {
    setDateDialogOpen(open);
    if (open) {
      setDraftDateRange({
        start: appliedDateRange.start ? new Date(appliedDateRange.start) : null,
        end: appliedDateRange.end ? new Date(appliedDateRange.end) : null,
      });
    }
  };

  const applyDateFilter = () => {
    setAppliedDateRange({
      start: draftDateRange.start,
      end: draftDateRange.end,
    });
    setDateDialogOpen(false);
  };

  const clearDateFilter = () => {
    const resetRange: DateRangeState = { start: null, end: null };
    setDraftDateRange(resetRange);
    setAppliedDateRange(resetRange);
  };

  const handleDraftRangeSelect = (range?: DateRange) => {
    setDraftDateRange({
      start: range?.from ?? null,
      end: range?.to ?? null,
    });
  };

  const hasActiveDateFilter = Boolean(
    appliedDateRange.start || appliedDateRange.end,
  );
  const formatDateLabel = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
      : 'Any time';
  const dateFilterSummary = hasActiveDateFilter
    ? `${formatDateLabel(appliedDateRange.start)} - ${formatDateLabel(appliedDateRange.end)}`
    : 'All dates';

  const startDateParam = toParam(appliedDateRange.start ?? undefined, 'start');
  const endDateParam = toParam(appliedDateRange.end ?? undefined, 'end');

  const {
    data: apiData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: qk.reports.transactionFrequency(startDateParam, endDateParam),
    queryFn: () =>
      fetchTransactionFrequency({
        startDate: startDateParam,
        endDate: endDateParam,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(() => {
    if (!apiData) return [] as FrequencyRow[];
    return apiData.map((row, index) => ({
      category: row.category,
      count: Number(row.count ?? 0),
      color: CHART_VARS[index % CHART_VARS.length],
    }));
  }, [apiData]);

  const totalTransactions = rows.reduce((sum, row) => sum + row.count, 0);
  const rangeLabel = dateFilterSummary;

  let content: React.ReactNode = null;

  if (isLoading && !apiData) {
    content = <Skeleton className="h-[340px] w-full" />;
  } else if (error) {
    content = (
      <p className="text-sm text-destructive">
        Failed to load transaction frequency: {(error as Error).message}
      </p>
    );
  } else if (!rows.length) {
    content = (
      <p className="text-sm text-muted-foreground">
        No transactions found for this range.
      </p>
    );
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[380px] w-full">
        <BarChart
          accessibilityLayer
          data={rows}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => String(value)}
                formatter={(value) =>
                  `${value} transaction${Number(value) === 1 ? '' : 's'}`
                }
              />
            }
          />
          <Bar dataKey="count" radius={6}>
            {rows.map((row) => (
              <Cell key={row.category} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <div className="px-4 py-2">
      <Card className="my-6">
        <CardHeader className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Transaction Frequency</CardTitle>
            <CardDescription>
              Transactions per category · {rangeLabel}
              {totalTransactions > 0 && (
                <span className="ml-2 font-medium text-foreground">
                  ({totalTransactions} total)
                </span>
              )}
            </CardDescription>
          </div>
          <Dialog open={dateDialogOpen} onOpenChange={handleDateDialogChange}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full max-w-[280px] justify-between sm:w-auto sm:justify-start sm:max-w-none"
              >
                <span>Date Filter</span>
                <span className="ml-2 flex-1 truncate text-xs text-muted-foreground text-right sm:text-left">
                  {dateFilterSummary}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Filter by date</DialogTitle>
                <DialogDescription>
                  Choose a start and end date to limit visible transactions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-1">
                <Label className="mb-1 block">Date range</Label>
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={{
                    from: draftDateRange.start ?? undefined,
                    to: draftDateRange.end ?? undefined,
                  }}
                  defaultMonth={
                    draftDateRange.start ?? draftDateRange.end ?? undefined
                  }
                  onSelect={handleDraftRangeSelect}
                  showOutsideDays
                  className="rounded-lg border bg-popover p-1.5 text-popover-foreground shadow"
                  classNames={dateFilterCalendarClassNames}
                />
              </div>
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" onClick={clearDateFilter}>
                  Clear
                </Button>
                <div className="space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={applyDateFilter}>
                    Apply
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="py-6">
          {isFetching && rows.length > 0 ? (
            <div className="mb-2 text-xs text-muted-foreground">
              Refreshing data…
            </div>
          ) : null}
          {content}
          {rows.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {rows.map((row) => (
                <div key={row.category} className="flex items-center gap-2">
                  <span
                    className="inline-flex h-3 w-3 rounded-sm"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-muted-foreground">{row.category}</span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
