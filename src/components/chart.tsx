"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { fetchHistories } from "@/lib/fetcher/api";
import { useUiStore } from "@/store/ui";
import { qk } from "@/lib/react-query/keys";

type Row = { day: string; amount_in: number; amount_out: number };

const chartConfig = {
  in: { label: "IN", color: "var(--chart-3)" },   // pick distinct vars
  out: { label: "OUT", color: "var(--chart-7)" },
} satisfies ChartConfig;

export function Chart() {
  const selectedInterval = useUiStore((s) => s.chartInterval);
  const setSelectedInterval = useUiStore((s) => s.setChartInterval);
  const currency = useUiStore((s) => s.currency);

  const { data = [], isLoading, error } = useQuery<Row[]>({
    queryKey: qk.histories(selectedInterval),
    queryFn: () => fetchHistories(Number(selectedInterval)),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const rows = (data ?? []).map((r) => ({
    date: r.day,
    in: r.amount_in,
    out: r.amount_out,
  }));


  return (
    <div className="px-8 py-2 ">
      <Card className="my-6 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle className="my-4">Recent Transaction</CardTitle>
            <CardDescription>Last 90 days transactions overview</CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 mr-5">
            <Select
              value={selectedInterval}
              onValueChange={(v) => setSelectedInterval(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 1 month</SelectItem>
                <SelectItem value="90">Last 3 month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <LineChart accessibilityLayer data={rows} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  value
                    ? new Date(value).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
                    : ""
                }
              />
              <YAxis
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCurrency(v, currency)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    formatter={(value) => formatCurrency(value as number, currency)}
                  />
                }
              />
              <Legend />
              <Line
                dataKey="in"
                name={chartConfig.in.label}
                type="monotone"
                stroke={`var(--color-in)`}
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="out"
                name={chartConfig.out.label}
                type="monotone"
                stroke={`var(--color-out)`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
