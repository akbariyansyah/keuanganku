"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart, Tooltip as RechartsTooltip } from "recharts";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { formatRupiah } from "@/utils/formatter";
import { CHART_VARS } from "@/constant/chart-color";
import { fetchReportSummary } from "@/lib/fetcher/api";
import { qk } from "@/lib/react-query/keys";

type ApiRow = { name: string; total: number }; // matches API aliases


export function ChartPieLegend() {
    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.summary,
        queryFn: async () => {
            const res = await fetchReportSummary();
            return (res?.data ?? []).map((r: any) => ({
                name: String(r.name ?? "-"),
                total: Number(r.total ?? r.sum ?? 0),
            })) as ApiRow[];
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
    const rows = Array.isArray(data) ? data : [];

    // Build chart data & config dynamically
    const chartData = useMemo(() => {
        if (!Array.isArray(rows)) return [];
        return rows.map((r, i) => ({
            // recharts props expected by your legend/content
            category: r.name,               // legend label key
            amount: r.total,             // value key used by <Pie dataKey="amount" />
            fill: CHART_VARS[i % CHART_VARS.length],
        }));
    }, [rows]);

    const chartConfig: ChartConfig = useMemo(() => {
        const base: any = { amount: { label: "Amount" } };
        rows.forEach((r, i) => {
            base[r.name] = { label: r.name, color: CHART_VARS[i % CHART_VARS.length] };
        });
        return base;
    }, [rows]);

    if (error) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 text-sm text-red-600">
                    Failed to load data: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="px-8 py-2 ">
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
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
                                content={<ChartLegendContent nameKey="category" payload={undefined} />}
                                className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-start"
                            />

                            <RechartsTooltip
                                // value is the slice value
                                formatter={(value: number) => [formatRupiah(Number(value)), "Amount"]}
                                // label is the slice label if provided via nameKey
                                labelFormatter={(label: string) => String(label)}
                                wrapperStyle={{ outline: "clip" }} // optional: remove focus ring box
                            />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
