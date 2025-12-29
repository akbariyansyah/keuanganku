import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PerformanceLevel } from '@/lib/fetcher/api';
import { CurrencyCode, formatCurrency } from '@/utils/currency';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from 'recharts';

type LevelRow = {
  achieved: number;
  remaining: number;
  progressPct: number;
  color: string;
  level: number;
  label: string;
  goal: number;
};

const levelChartConfig = {
  achieved: { label: 'Current value', color: 'var(--chart-1)' },
  remaining: { label: 'To goal', color: 'var(--chart-5)' },
} satisfies ChartConfig;

interface AssetGoalProps {
  currentLevelInfo: PerformanceLevel | null;
  currency: CurrencyCode;
  currentValue: number;
  levelRows: LevelRow[];
  levelsError: Error | null;
  isLoadingLevels: boolean;
}

export default function AssetGoalLevelChart({
  currentLevelInfo,
  currentValue,
  currency,
  levelRows,
  levelsError,
  isLoadingLevels,
}: AssetGoalProps) {
  return (
    <>
      <Card className="pt-0 mt-6">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Asset Goal Levels</CardTitle>
            <CardDescription>
              Current asset value stacked against each level target
            </CardDescription>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-sm font-semibold">
              Current Level: {currentLevelInfo?.label ?? 'N/A'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(currentValue, currency)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {levelsError ? (
            <p className="text-sm text-destructive">
              Failed to load asset goals: {(levelsError as Error).message}
            </p>
          ) : isLoadingLevels ? (
            <p className="text-sm text-muted-foreground">
              Loading asset goals...
            </p>
          ) : !levelRows.length ? (
            <p className="text-sm text-muted-foreground">
              No goal levels available.
            </p>
          ) : (
            <ChartContainer
              config={levelChartConfig}
              className="aspect-auto h-[360px] w-full"
            >
              <BarChart
                data={levelRows}
                margin={{ left: 6, right: 6, bottom: 12 }}
                barSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => formatCurrency(Number(v), currency)}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const label =
                          name === 'achieved'
                            ? ' Current value'
                            : ' Remaining to goal';
                        return [formatCurrency(Number(value), currency), label];
                      }}
                      labelFormatter={(label, payload) => {
                        const level = payload?.[0]?.payload;
                        const percent = level?.progressPct
                          ? ` (${level.progressPct.toFixed(1)}%)`
                          : '';
                        return `${label}${percent}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="achieved" stackId="goal" radius={[4, 4, 0, 0]}>
                  {levelRows.map((entry) => (
                    <Cell key={`achieved-${entry.level}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="remaining" stackId="goal" radius={[4, 4, 0, 0]}>
                  {levelRows.map((entry) => (
                    <Cell
                      key={`remaining-${entry.level}`}
                      fill={entry.color}
                      fillOpacity={0.2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}
