"use client"


import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive line chart"

async function fetchHistories() {
    const res = await fetch(`/api/report/histories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch summary");
    const json = (await res.json()) as HistorySummaryResponse;
    return json.data;
}

const chartConfig = {
    // views: {
    //     label: "Transaction Amount",
    //     color: "var(--chart-1)",
    // },
    desktop: {
        label: "Transaction Amount",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function Chart() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["histories"],
        queryFn: fetchHistories,
        staleTime: 60_000, // cache for 1 minute
        refetchOnWindowFocus: false,
    });

    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("desktop")

    return (
        <div className="px-8 py-4">
            <Card className="py-4 sm:py-0">
                <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                        <CardTitle>Line Chart - Interactive</CardTitle>
                        <CardDescription>
                            Last 30 days transactions overview
                        </CardDescription>
                    </div>
                    <div className="flex">
                        {["desktop"].map((key) => {
                            const chart = key as keyof typeof chartConfig
                            return (
                                <button
                                    key={chart}
                                    data-active={activeChart === chart}
                                    className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                    onClick={() => setActiveChart(chart)}
                                >
                                    <span className="text-muted-foreground text-xs">
                                        {chartConfig[chart].label}
                                    </span>

                                </button>
                            )
                        })}
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={data ? data.map(item => ({
                                date: item.created_at,
                                desktop: item.amount,
                            })) : []}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value: string) => {
                                    if (!value) return "";
                                    return new Date(value).toLocaleDateString("en-US", {
                                        month: "2-digit", // MM
                                        day: "2-digit"    // DD
                                    });
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="views"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey={activeChart}
                                type="monotone"
                                stroke={`var(--color-${activeChart})`}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
