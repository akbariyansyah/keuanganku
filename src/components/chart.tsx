"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNum } from "@/utils/formatter";

type Row = { day: string; amount_in: number; amount_out: number };
type HistorySummaryResponse = { data: Row[] };

async function fetchHistories() {
  const res = await fetch(`/api/report/histories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  const json = (await res.json()) as HistorySummaryResponse;
  return json.data;
}

const chartConfig = {
  in:  { label: "IN",  color: "var(--chart-3)" },   // pick distinct vars
  out: { label: "OUT", color: "var(--chart-7)" },
} satisfies ChartConfig;

export function Chart() {
  const { data } = useQuery({
    queryKey: ["histories"],
    queryFn: fetchHistories,
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
                tickFormatter={(v) => formatNum(v)}
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
