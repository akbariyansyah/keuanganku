"use client";

import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { qk } from "@/lib/react-query/keys";
import { fetchCashflowOvertime } from "@/lib/fetcher/report";
import { useUiStore } from "@/store/ui";
import { formatCurrency } from "@/utils/currency";

type CashflowLineRow = {
    month: string;
    income: number;
    expenses: number;
    cashflow: number;
};

const chartConfig = {
    income: {
        label: "Income",
        color: "var(--chart-1)",
    },
    expenses: {
        label: "True Expenses",
        color: "var(--chart-5)",
    },
    cashflow: {
        label: "Cashflow",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const lineDescriptions = [
    {
        key: "income",
        label: "Income",
        description: "All incoming transactions per month.",
    },
    {
        key: "expenses",
        label: "True Expenses",
        description: "Spending excluding saving category.",
    },
    {
        key: "cashflow",
        label: "Cashflow",
        description: "Income minus true expenses.",
    },
] as const;

export default function CashflowOvertimePage() {
    const currency = useUiStore((state) => state.currency);
    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.cashflowOvertime,
        queryFn: fetchCashflowOvertime,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const rows = useMemo<CashflowLineRow[]>(() => {
        return (data ?? []).map((row) => ({
            month: row.month_label,
            income: Number(row.income_total ?? 0),
            expenses: Number(row.expense_total ?? 0),
            cashflow: Number(row.cashflow ?? 0),
        }));
    }, [data]);

    const latest = rows.length ? rows[rows.length - 1] : undefined;

    let content: React.ReactNode = null;

    if (isLoading && !data) {
        content = <Skeleton className="h-[320px] w-full" />;
    } else if (error) {
        content = (
            <p className="text-sm text-destructive">
                Failed to load cashflow overtime: {(error as Error).message}
            </p>
        );
    } else if (!rows.length) {
        content = (
            <p className="text-sm text-muted-foreground">
                No cashflow activity recorded for the monitored months.
            </p>
        );
    } else {
        content = (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <LineChart accessibilityLayer data={rows} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        minTickGap={24}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCurrency(value, currency)}
                    />
                    <ChartTooltip
                        cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                        content={
                            <ChartTooltipContent
                                labelFormatter={(value) => String(value)}
                                formatter={(value, name, item) => {
                                    const key = (item?.dataKey ?? name) as keyof typeof chartConfig;
                                    const label = chartConfig[key]?.label ?? name;
                                    return (
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: `var(--color-${item?.dataKey ?? name})` }}
                                                />
                                                {label}
                                            </span>
                                            <span className="font-semibold">
                                                {formatCurrency(Number(value ?? 0), currency)}
                                            </span>
                                        </div>
                                    );
                                }}
                            />
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke="var(--color-income)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--color-expenses)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="cashflow"
                        stroke="var(--color-cashflow)"
                        strokeWidth={3}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        );
    }

    return (
        <div className="px-8 py-2">
            <Card className="my-6">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Cashflow Over Time</CardTitle>
                        <CardDescription className="mt-4">
                            Income vs true expenses (excluding savings) · Last 12 months
                        </CardDescription>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {lineDescriptions.map((item) => (
                                <div key={item.key} className="flex items-start gap-2">
                                    <span
                                        className="mt-1 inline-block h-2 w-2 rounded-full"
                                        style={{ backgroundColor: `var(--color-${item.key})` }}
                                    />
                                    <span>
                                        <span className="font-semibold text-foreground">{item.label}:</span>{" "}
                                        {item.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {latest && (
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Latest cashflow ({latest.month})
                            </p>
                            <p className="text-3xl font-semibold">
                                {formatCurrency(latest.cashflow, currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Income {formatCurrency(latest.income, currency)} · Expenses{" "}
                                {formatCurrency(latest.expenses, currency)}
                            </p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="py-6">{content}</CardContent>
            </Card>
        </div>
    );
}
