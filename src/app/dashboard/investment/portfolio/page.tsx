"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { fetchPortfolio } from "@/lib/fetcher/api"
import { toChartData } from "@/utils/formatter"
import { CHART_VARS } from "@/constant/chart-color"

type ChartRow = { month: string } & Record<string, number>;

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<ChartRow[]>([]);
    const categories = useMemo(() => {
        const set = new Set<string>();
        portfolio.forEach((row) => {
            Object.entries(row).forEach(([key, val]) => {
                if (key !== "month" && typeof val === "number") set.add(key);
            });
        });
        return Array.from(set);
    }, [portfolio]);

    const chartConfig: ChartConfig = useMemo(() => {
        const base: ChartConfig = {};
        categories.forEach((cat, idx) => {
            base[cat] = { label: cat, color: CHART_VARS[idx % CHART_VARS.length] };
        });
        return base;
    }, [categories]);

    const fetchData = async () => {
        try {
            const res = await fetchPortfolio();
            setPortfolio(toChartData(res ?? []))
        } catch (err) {
            console.log('error happened', err)
        }
    }
    useEffect(() => {
        fetchData();
    }, [])

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
            <ChartContainer config={chartConfig} className="min-h-[500px] w-full">
                <BarChart accessibilityLayer data={portfolio} barSize={40}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis width={150} tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent nameKey="month" payload={undefined} />} />
                    {categories.map((cat, idx) => (
                        <Bar
                            key={cat}
                            dataKey={cat}
                            stackId="allocation"
                            fill={CHART_VARS[idx % CHART_VARS.length]}
                            radius={idx === categories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
            <Link href={"/dashboard/investment/portfolio/add"}>
                <Button className="w-[100]">
                    Add
                </Button>
            </Link>
        </div>
    )
}
