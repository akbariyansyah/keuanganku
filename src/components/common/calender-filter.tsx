'use client';

import { useMemo, useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DEFAULT_RANGE_DAYS } from '@/constant/duration';

export const toParam = (date: Date | undefined, boundary: 'start' | 'end') => {
  if (!date) return undefined;
  const next = new Date(date);
  if (boundary === 'start') {
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(23, 59, 59, 999);
  }
  return next.toISOString();
};

export const createDefaultRange = (): DateRange => {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0); // end of current month
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from, to };
};

const calendarClassNames: CalendarProps['classNames'] = {
  months: 'flex flex-col space-y-3 p-2.5',
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

export const dateFilterCalendarClassNames: CalendarProps['classNames'] = {
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
  selected: 'bg-primary text-white rounded-lg text-sm',
  range_middle: 'bg-muted text-foreground',
  today: 'ring-1 ring-foreground/30 text-foreground',
  outside: 'text-muted-foreground opacity-70',
  disabled: 'text-muted-foreground opacity-50',
  hidden: 'invisible',
};

const calendarComponents = {
  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
  IconRight: () => <ChevronRight className="h-4 w-4" />,
} as any;

interface CalendarFilterProps {
  /**
   * Controlled or initial range. If provided, CalenderFilter will sync its
   * internal selection with this prop.
   */
  range?: DateRange;
  /**
   * Called whenever the selection changes (user picks a date).
   */
  onChange?: (range?: DateRange) => void;
  /**
   * Called when a full range (from + to) is applied — this should be used by
   * the parent to trigger fetching / updating query keys.
   */
  onApply?: (range?: DateRange) => void;
}

const formatRange = (range?: DateRange) => {
  const fromLabel = formatDisplayDate(range?.from);
  const toLabel = formatDisplayDate(range?.to);

  if (fromLabel && toLabel) {
    return `${fromLabel} - ${toLabel}`;
  }
  if (fromLabel) {
    return `${fromLabel} - Select end date`;
  }
  return 'Select date range';
};

const formatDisplayDate = (date?: Date) =>
  date
    ? date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

export default function CalenderFilter({
  range,
  onChange,
  onApply,
}: CalendarFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => range ?? createDefaultRange(),
  );
  const [appliedRange, setAppliedRange] = useState<DateRange>(
    () => range ?? createDefaultRange(),
  );

  // keep internal selection in sync when parent controls `range`
  useEffect(() => {
    if (range) {
      setSelectedRange(range);
      setAppliedRange(range);
    }
  }, [range]);

  const handleRangeSelect = (r?: DateRange) => {
    setSelectedRange(r);
    onChange?.(r);

    if (r?.from && r?.to) {
      setAppliedRange(r);
      // notify parent immediately that a full range is applied
      onApply?.(r);
    }
  };

  const resetRange = () => {
    const defaults = createDefaultRange();
    setSelectedRange(defaults);
    setAppliedRange(defaults);
    onChange?.(defaults);
    onApply?.(defaults);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal md:w-[280px]',
              !selectedRange && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRange(selectedRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={selectedRange}
            onSelect={handleRangeSelect}
            numberOfMonths={1}
            showOutsideDays
            className="rounded-xl border bg-popover p-4 text-popover-foreground shadow"
            classNames={calendarClassNames}
            components={calendarComponents}
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" onClick={resetRange}>
        Reset
      </Button>
    </div>
  );
}
