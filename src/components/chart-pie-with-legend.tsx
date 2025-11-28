"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart, Tooltip as RechartsTooltip } from "recharts";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/utils/currency";
import { CHART_VARS } from "@/constant/chart-color";
import { fetchReportSummary } from "@/lib/fetcher/report";
import { qk } from "@/lib/react-query/keys";
import { useUiStore } from "@/store/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";

type ApiRow = { name: string; total: number }; // matches API aliases

export function ChartPieLegend() {
    const [interval, setInterval] = useState("7");
    const currency = useUiStore((state) => state.currency);
    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.categorySummary(interval),
        queryFn: async () => {
            const res = await fetchReportSummary(Number(interval));
            const rows = (res?.data ?? []).map((r: any) => ({
                name: String(r.name ?? "-"),
                total: Number(r.total ?? 0),
            })) as ApiRow[];
            return rows;

        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
    const rows = Array.isArray(data) ? data : [];

    const rowsWithTransactions = useMemo(
        () => rows.filter((r) => Number(r.total ?? 0) > 0),
        [rows],
    );

    // Build chart data & config dynamically
    const chartData = useMemo(() => {
        if (!Array.isArray(rowsWithTransactions)) return [];
        return rowsWithTransactions.map((r, i) => ({
            // recharts props expected by your legend/content
            category: r.name,               // legend label key
            amount: Number(r.total ?? 0),   // used by <Pie dataKey="amount" />
            original: Number(r.total ?? 0), // preserve real value for tooltips/labels
            fill: CHART_VARS[i % CHART_VARS.length],
        }));
    }, [rowsWithTransactions]);

    const chartConfig: ChartConfig = useMemo(() => {
        const base: any = { amount: { label: "Amount" } };
        rowsWithTransactions.forEach((r, i) => {
            base[r.name] = { label: r.name, color: CHART_VARS[i % CHART_VARS.length] };
        });
        return base;
    }, [rowsWithTransactions]);

    if (isLoading) {
        return (
            <div className="px-8 py-2 ">
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Expenses Summary</CardTitle>
                    </CardHeader>
                    <Skeleton
                        className="h-60 w-275 px-5 animate-pulse"
                    />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Expenses Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 text-sm text-red-600">
                    Failed to load data: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    const hasChartData = chartData.length > 0;

    return (
        <div className="px-8 py-2 ">
            <Card className="flex flex-col">
                <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                        <CardTitle className="my-4">Expenses Summary</CardTitle>
                        <CardDescription className="my-4">Last {interval} days expenses</CardDescription>
                    </div>
                    <div className="flex flex-col justify-center gap-1 mr-5 mb-4">
                        <Select
                            value={interval}
                            onValueChange={(v) => setInterval(v)}
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

                <CardContent className="flex-1 pb-0">
                    {hasChartData ? (
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[500px]"
                        >
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="amount"
                                    nameKey="category"
                                    // optional: innerRadius for donut style
                                    // innerRadius={50}
                                    // outerRadius={100}
                                    isAnimationActive
                                />
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="category" payload={{}} />}
                                    className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-start"
                                />

                                <RechartsTooltip
                                    // Show the original amount in tooltip, not the minimal slice value
                                    formatter={(value: number, _name: string, item: any) => [
                                        formatCurrency(Number(item?.payload?.original ?? value), currency),
                                        "Amount",
                                    ]}
                                    // label is the slice label if provided via nameKey
                                    labelFormatter={(label: string) => String(label)}
                                    wrapperStyle={{ outline: "clip" }} // optional: remove focus ring box
                                />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
                            No category transactions for this range.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
