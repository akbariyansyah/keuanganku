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
import { Button } from '@/components/ui/button';
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
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
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
import { createDefaultRange, toParam } from '@/components/common/calender-filter';
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

type DateRangeState = {
  start: Date | null;
  end: Date | null;
};

const dateFilterCalendarClassNames: CalendarProps['classNames'] = {
  months: 'flex flex-col space-y-1 p-1.5',
  month: 'space-y-2.5',
  caption:
    'flex items-center justify-center pt-1 text-sm font-semibold text-foreground',
  caption_label: 'text-sm font-semibold',
  nav: 'flex items-center justify-between text-foreground',
  button_previous:
    'inline-flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-transparent text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
  button_next:
    'inline-flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-transparent text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
  month_grid: 'w-full border-collapse text-sm',
  weekdays: 'flex justify-between px-1',
  weekday: 'w-9 text-center text-[0.78rem] font-medium text-muted-foreground',
  week: 'mt-1 flex w-full justify-between gap-1.5',
  day: 'flex h-9 w-9 items-center justify-center text-[0.95rem] font-medium',
  day_button:
    'h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring',
  range_start: 'bg-foreground text-background rounded-lg text-sm',
  range_end: 'bg-foreground text-background rounded-lg text-sm',
  selected: 'bg-foreground text-background rounded-lg text-sm',
  range_middle: 'bg-muted text-foreground',
  today: 'ring-1 ring-foreground/30 text-foreground',
  outside: 'text-muted-foreground opacity-70',
  disabled: 'text-muted-foreground opacity-50',
  hidden: 'invisible',
};

export default function TransactionRadar() {
  const currency = useUiStore((state) => state.currency);
  const defaultRange = useMemo(() => createDefaultRange(), []);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeState>(() => ({
    start: defaultRange.from ?? null,
    end: defaultRange.to ?? null,
  }));
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
              Budget allocation per category · <b>{dateFilterSummary}</b>
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
