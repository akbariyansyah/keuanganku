"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchPortfolio } from "@/lib/fetcher/api"
import { toChartData } from "@/utils/formatter"

const chartConfig = {
    Crypto: {
        label: "Crypto",
        color: "#b79c24ff",
    },
    Stocks: {
        label: "Stocks",
        color: "#60a5fa",
    },
    Cash: {
        label: "Cash",
        color: "#17c02eff",
    },
} satisfies ChartConfig

type ChartRow = { month: string } & Record<string, number>;

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<ChartRow[]>([]);
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
                <BarChart accessibilityLayer data={portfolio}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                    <Bar dataKey="Crypto" fill="var(--color-Crypto)" radius={4} />
                    <Bar dataKey="Stocks" fill="var(--color-Stocks)" radius={4} />
                    <Bar dataKey="Cash" fill="var(--color-Cash)" radius={4} />
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
