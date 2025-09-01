"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

async function fetchHistories() {
  const res = await fetch(`/api/report/histories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  const json = (await res.json()) as HistorySummaryResponse;
  return json.data;
}

const chartConfig = {
  desktop: {
    label: "Transaction Amount",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function Chart() {
  const { data } = useQuery({
    queryKey: ["histories"],
    queryFn: fetchHistories,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // no toggle state, single series only
  const seriesKey: keyof typeof chartConfig = "desktop";

  return (
    <div className="px-8 py-2 ">
      <Card className="my-6 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle className="my-4">Recent Transaction</CardTitle>
            <CardDescription>Last 30 days transactions overview</CardDescription>
          </div>
          {/* removed the right-side active chip/buttons */}
        </CardHeader>

        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <LineChart
              accessibilityLayer
              data={
                data
                  ? data.map((item) => ({
                      date: item.created_at,
                      desktop: item.amount,
                    }))
                  : []
              }
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  value
                    ? new Date(value).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : ""
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    // show the correct series name in tooltip
                    nameKey={seriesKey}
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
              <Line
                dataKey={seriesKey}
                type="monotone"
                stroke={`var(--color-${seriesKey})`}
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
