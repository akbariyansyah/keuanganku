"use client";

import * as React from "react";
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

type ApiRow = { name: string; total: number }; // matches API aliases

const CHART_VARS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
];

export function ChartPieLegend() {
    const [rows, setRows] = React.useState<ApiRow[] | null>(null);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/report/summary", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const data: ApiRow[] = (json?.data ?? []).map((r: any) => ({
                    name: String(r.name ?? "-"),
                    total: Number(r.total ?? r.sum ?? 0), // fallback if you didn’t add aliases
                }));
                setRows(data);
            } catch (e: any) {
                setErr(e?.message || "fetch_failed");
            }
        })();
    }, []);

    // Build chart data & config dynamically
    const chartData = React.useMemo(() => {
        if (!rows) return [];
        return rows.map((r, i) => ({
            // recharts props expected by your legend/content
            category: r.name,               // legend label key
            amount: r.total,             // value key used by <Pie dataKey="amount" />
            fill: CHART_VARS[i % CHART_VARS.length],
        }));
    }, [rows]);

    const chartConfig: ChartConfig = React.useMemo(() => {
        const base: any = { amount: { label: "Amount" } };
        rows?.forEach((r, i) => {
            base[r.name] = { label: r.name, color: CHART_VARS[i % CHART_VARS.length] };
        });
        return base;
    }, [rows]);

    if (err) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 text-sm text-red-600">
                    Failed to load data: {err}
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
