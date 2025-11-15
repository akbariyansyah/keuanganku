"use client";

import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fetchTransactionFrequency } from "@/lib/fetcher/report";
import { qk } from "@/lib/react-query/keys";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_VARS } from "@/constant/chart-color";

type FrequencyRow = {
  category: string;
  count: number;
  color: string;
};

const DEFAULT_RANGE_DAYS = 30;

const chartConfig = {
  count: {
    label: "Transactions",
  },
} satisfies ChartConfig;

const createDefaultRange = (): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (DEFAULT_RANGE_DAYS - 1));
  return { from, to };
};

const formatRange = (range?: DateRange) => {
  const fromLabel = formatDisplayDate(range?.from);
  const toLabel = formatDisplayDate(range?.to);

  if (fromLabel && toLabel) {
    return `${fromLabel} - ${toLabel}`;
  }
  if (fromLabel) {
    return `${fromLabel} - Select end date`;
  }
  return "Select date range";
};

const formatDisplayDate = (date?: Date) =>
  date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

const toParam = (date: Date | undefined, boundary: "start" | "end") => {
  if (!date) return undefined;
  const next = new Date(date);
  if (boundary === "start") {
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(23, 59, 59, 999);
  }
  return next.toISOString();
};

const calendarClassNames: CalendarProps["classNames"] = {
  months: "flex flex-col space-y-4 p-3",
  month: "space-y-4",
  caption: "flex items-center justify-center pt-1",
  caption_label: "text-sm font-medium",
  nav: "flex items-center justify-between px-2",
  nav_button:
    "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
  nav_button_previous: "",
  nav_button_next: "",
  table: "w-full border-collapse space-y-1 text-sm",
  head_row: "flex",
  head_cell: "text-muted-foreground rounded-md w-9 font-normal",
  row: "flex w-full mt-2",
  cell: cn(
    "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:rounded-md",
    "[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-outside)]:text-muted-foreground",
    "focus-within:relative focus-within:z-20"
  ),
  day: cn(
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
    "hover:bg-accent hover:text-accent-foreground rounded-md"
  ),
  day_range_end: "day-range-end",
  day_selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  day_today: "bg-accent text-accent-foreground",
  day_outside:
    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
  day_disabled: "text-muted-foreground opacity-50",
  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
  day_hidden: "invisible",
};

const calendarComponents: CalendarProps["components"] = {
  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
  IconRight: () => <ChevronRight className="h-4 w-4" />,
};

export default function BarTransactionFrequencyPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() => createDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => createDefaultRange());

  const startDateParam = toParam(appliedRange.from, "start");
  const endDateParam = toParam(appliedRange.to, "end");

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
    enabled: Boolean(startDateParam && endDateParam),
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
  const rangeLabel = formatRange(appliedRange);

  const handleRangeSelect = (range?: DateRange) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      setAppliedRange(range);
    }
  };

  const resetRange = () => {
    const defaults = createDefaultRange();
    setSelectedRange(defaults);
    setAppliedRange(defaults);
  };

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
    content = <p className="text-sm text-muted-foreground">No transactions found for this range.</p>;
  } else {
    content = (
      <ChartContainer config={chartConfig} className="h-[380px] w-full">
        <BarChart accessibilityLayer data={rows} margin={{ left: 12, right: 12 }}>
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
            cursor={{ fill: "hsl(var(--muted))" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => String(value)}
                formatter={(value) => `${value} transaction${Number(value) === 1 ? "" : "s"}`}
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
    <div className="px-8 py-2">
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
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal md:w-[280px]",
                    !selectedRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatRange(selectedRange)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={selectedRange?.from}
                  selected={selectedRange}
                  onSelect={handleRangeSelect}
                  numberOfMonths={1}
                  showOutsideDays
                  className="rounded-lg border shadow-sm"
                  classNames={calendarClassNames}
                  components={calendarComponents}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" onClick={resetRange}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {isFetching && rows.length > 0 ? (
            <div className="mb-2 text-xs text-muted-foreground">Refreshing data…</div>
          ) : null}
          {content}
          {rows.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {rows.map((row) => (
                <div key={row.category} className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-sm" style={{ backgroundColor: row.color }} />
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
