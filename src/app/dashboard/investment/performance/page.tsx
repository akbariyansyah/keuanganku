"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { fetchInvestmentPerformance, Performance } from "@/lib/fetcher/api"
import { useQuery } from "@tanstack/react-query"
import { qk } from "@/lib/react-query/keys"
import { formatCurrency } from "@/utils/currency"
import { useUiStore } from "@/store/ui"
import MetricCard, { MetricItem } from "@/components/metric-card"

const chartConfig = {
    total: { label: "Total", color: "var(--chart-4)" },
} satisfies ChartConfig

export default function ChartAreaInteractive() {
    const currency = useUiStore((state) => state.currency)
    const { data = [], isLoading, error } = useQuery<Performance[]>({
        queryKey: qk.investments.performance,
        queryFn: fetchInvestmentPerformance,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })

    const performance = React.useMemo(() => {
        const rows = (Array.isArray(data) ? data : []).map((r) => ({
            date: r.date,
            total: Number(r.total ?? 0),
        }))

        return rows;
    }, [data])

    const items = React.useMemo(() => {
        if (!data) return [] as Array<MetricItem>;
        return [
            {
                title: "Current Assets",
                value:"1010101010",
                delta: 1

            },
            {
                title: "Assets Growth This Month",
                value: "78%",
                delta: 1

            },
            {
                title: "Assets Growth Total",
                value: "78%",
                delta: -1

            },
    
        ] satisfies Array<MetricItem>;
    }, [currency, data]);
    const currentValue = data[data.length - 1];

    return (
        <div className="w-350 m-4">
            <div className="grid gap-1 grid-cols-3 my-6  w-225">
                {items.map((item) => (
                    <MetricCard key={item.title} {...item} delta={item.delta}/>
                ))}

            </div>
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Performance Asset</CardTitle>
                        <CardDescription>
                            Showing investment performance over time
                        </CardDescription>
                    </div>
                    <div className="">
                        <h3 className="text-md ">
                            Current Value : {formatCurrency(currentValue?.total, currency)}
                        </h3>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={performance}>
                            <defs>
                                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-total)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-total)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }}
                            />
                            <YAxis
                                width={85}
                                tickMargin={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => formatCurrency(v, currency)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                        formatter={(value) => formatCurrency(value as number, currency)}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="total"
                                type="natural"
                                fill="url(#fillTotal)"
                                stroke="var(--color-total)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
