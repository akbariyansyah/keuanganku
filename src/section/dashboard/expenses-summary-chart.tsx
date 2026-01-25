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
import { Button } from '@/components/ui/button';
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
import { DateRange } from 'react-day-picker';
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
type ApiRow = { name: string; total: number }; // matches API aliases

type DateRangeState = {
  start: Date | null;
  end: Date | null;
};

export function ChartPieLegend() {
  const currency = useUiStore((state) => state.currency);

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
          <Skeleton className="h-160 w-full px-5 animate-pulse" />
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
    bg-card"
      >
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle className="my-1">Expenses Summary</CardTitle>
            <CardDescription className="my-1">
              Transaction period: <b>{dateFilterSummary}</b>
            </CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 mr-5 mb-4">
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearDateFilter}
                  >
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
