"use client"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"
import { useUiStore } from "@/store/ui"
import { fetchTransactionCategoryRadar } from "@/lib/fetcher/report"
import { qk } from "@/lib/react-query/keys"
import { formatCurrency } from "@/utils/currency"

export const description = "A bar chart with a custom label"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-5)",
    },
    label: {
        color: "var(--background)",
    },
} satisfies ChartConfig

export default function TransactionRadar() {
    const currency = useUiStore((state) => state.currency);

    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.categoryRadar,
        queryFn: fetchTransactionCategoryRadar,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const finalData = [
        ...(data || []).map((item) => ({
            month: item.category,
            desktop: item.total,
        })),
    ]
    return (
        <Card className="m-10">
            <CardHeader>
                <CardTitle>Transaction Category Radar</CardTitle>
                <CardDescription>2025</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={finalData}
                        // layout="vertical"
                        margin={{
                            right: 16,
                            top: 16,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={true}
                            tickMargin={10}
                            
                        />

                        <YAxis
                            dataKey="desktop"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={90}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />

                        <Bar
                            dataKey="desktop"
                            fill="var(--color-desktop)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="desktop"
                                position="top"
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value) => formatCurrency(value, currency)}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                {/* <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div> */}
            </CardFooter>
        </Card>
    )
}
