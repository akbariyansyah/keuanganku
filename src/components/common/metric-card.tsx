import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

export type MetricItem = {
  title: string;
  value: string;
  percentChange?: number | null;
  comparisonLabel?: string;
};

const formatPercent = (percent?: number | null) => {
  if (percent === undefined || percent === null) return null;
  if (Math.abs(percent) < 0.01) return '0%';
  const rounded =
    Math.abs(percent) >= 100
      ? Math.round(percent)
      : Math.round(percent * 10) / 10;
  const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
  return `${sign}${Math.abs(rounded)}%`;
};

export default function MetricCard({
  title,
  value,
  percentChange,
  comparisonLabel,
}: MetricItem) {
  const percentLabel = formatPercent(percentChange);
  const isPositive = (percentChange ?? 0) > 0;
  const isNegative = (percentChange ?? 0) < 0;

  return (
    <Card
      className="
    w-full
    border border-muted-foreground/20
    backdrop-blur
    bg-gradient-to-t
    from-gray-200/80
    via-gray-100/60
    to-gray-100/30
    dark:from-gray-800/80
    dark:via-gray-800/50
    dark:to-gray-900/20
  "
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {percentLabel && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isPositive
                  ? 'text-emerald-600'
                  : isNegative
                    ? 'text-red-600'
                    : 'text-muted-foreground'
              }`}
            >
              {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
              {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
              <span>{percentLabel}</span>
            </div>
          )}
        </div>
        {comparisonLabel && (
          <CardDescription className="text-xs text-muted-foreground">
            Compared to {comparisonLabel}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl font-semibold tracking-tight mb-2">{value}</div>
      </CardContent>
    </Card>
  );
}
