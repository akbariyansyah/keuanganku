'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, CurrencyCode } from '@/utils/currency';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDetailValue(
  value: number | null,
  currency: CurrencyCode,
): string {
  if (value === null) return 'Rp —';
  return formatCurrency(value, currency);
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type AssetCategoryAccordionProps = {
  items: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
  chartColors: string[];
  currency: CurrencyCode;
  onRetry?: () => void;
};

// ─────────────────────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────────────────────

function AccordionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-sm" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────────────────────

function AccordionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function AssetCategoryAccordion({
  items,
  isLoading,
  error,
  chartColors,
  currency,
  onRetry,
}: AssetCategoryAccordionProps) {
  if (isLoading) return <AccordionSkeleton />;
  if (error) return <AccordionError message={error} onRetry={onRetry} />;
  if (items.length === 0) return null;

  // Compute total across all categories for percentage
  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, idx) => {
        const categoryTotal = Number(item.total || 0);
        const percentage =
          grandTotal > 0
            ? ((categoryTotal / grandTotal) * 100).toFixed(1)
            : '0.0';
        const dotColor = chartColors[idx % chartColors.length];
        const details: AssetDetail[] = item.detail ?? [];

        return (
          <AccordionItem key={`${item.name}-${idx}`} value={`item-${idx}`}>
            <AccordionTrigger className="hover:no-underline px-1">
              <div className="flex w-full items-center gap-3 pr-2">
                {/* Color dot */}
                <div
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: dotColor }}
                />

                {/* Category name */}
                <span className="flex-1 truncate text-left font-medium">
                  {item.name}
                </span>

                {/* Percentage */}
                <span className="text-muted-foreground text-sm tabular-nums w-14 text-right shrink-0">
                  {percentage}%
                </span>

                {/* Formatted total */}
                <span className="font-semibold text-sm tabular-nums w-28 sm:w-36 text-right shrink-0">
                  {formatCurrency(categoryTotal, currency)}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              {details.length === 0 ? (
                <p className="px-7 py-2 text-sm italic text-muted-foreground">
                  No breakdown available for this category
                </p>
              ) : (
                <div className="space-y-0 px-7">
                  {/* Header */}
                  <div className="flex items-center border-b pb-2 mb-1">
                    <span className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ticker
                    </span>
                    <span className="w-14 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      (%)
                    </span>
                    <span className="w-28 sm:w-36 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Value
                    </span>
                  </div>

                  {/* Detail rows */}
                  {details.map((detail, dIdx) => {
                    const tickerPct =
                      detail.current_value !== null && categoryTotal > 0
                        ? (
                            (detail.current_value / categoryTotal) *
                            100
                          ).toFixed(1)
                        : '—';

                    return (
                      <div
                        key={`${detail.ticker}-${dIdx}`}
                        className="flex items-center py-2 border-b border-dashed last:border-b-0"
                      >
                        <span className="flex-1 text-sm font-medium truncate">
                          {detail.ticker}
                        </span>
                        <span className="w-14 text-right text-sm tabular-nums text-muted-foreground">
                          {tickerPct === '—' ? tickerPct : `${tickerPct}%`}
                        </span>
                        <span className="w-28 sm:w-36 text-right text-sm tabular-nums">
                          {formatDetailValue(detail.current_value, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
