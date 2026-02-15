'use client';

import { useMemo } from 'react';
import { Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CHART_VARS } from '@/constant/chart-color';

type PortfolioPieData = {
  name: string;
  value: number;
  fill: string;
};

type PortfolioPieChartProps = {
  data: PortfolioPieData[];
  config: ChartConfig;
};

export function PortfolioPieChart({ data, config }: PortfolioPieChartProps) {
  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (data.length === 0) {
    return (
      <div className="flex min-h-[100px] w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No portfolio data available for this month
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-[390px] w-full">
      <RechartsPieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
              formatter={(value, name) => {
                const numValue = Number(value);
                const percentage = ((numValue / totalValue) * 100).toFixed(1);
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{numValue.toLocaleString()}</span>
                      <span>({percentage}%)</span>
                    </div>
                  </>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent nameKey="name" payload={[]} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={90}
          paddingAngle={2}
          label={(entry: any) => {
            const percent = entry.percent as number;
            return `${entry.name} ${(percent * 100).toFixed(0)}%`;
          }}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
