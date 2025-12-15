"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/utils/currency";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Chart } from "@/components/chart";
import { ChartPieLegend } from "@/components/chart-pie-with-legend";
import { fetchReport } from "@/lib/fetcher/report";
import { qk } from "@/lib/react-query/keys";

import MetricCard, { MetricItem } from "@/components/metric-card";
import { useUiStore } from "@/store/ui";
import NetBalancePage from "./pages/net-balance";
import BarTransactionFrequencyPage from "./pages/bar-transaction-frequency";
import SavingRatePage from "./pages/saving-rate";
import { cn } from "@/lib/utils";
import CashflowOvertimePage from "./pages/cashflow-overtime";
import computePercentChange from "@/utils/matrix";

export default function DashboardKpiCards() {
    const currency = useUiStore((state) => state.currency);
    const [chartTab, setChartTab] = useState<"frequency" | "saving">("frequency");
    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.kpi,
        queryFn: fetchReport,
        staleTime: 60_000, // cache for 1 minute
        refetchOnWindowFocus: false,
    });

    const items = useMemo(() => {
        if (!data) return [] as Array<MetricItem>;
        const todaySpend = data.today.value;
        const weekSpend = data.this_week.value;
        const monthSpend = data.this_month.value;
        const totalTransaction = data.total_transaction.value;

        return [
            {
                title: "Today's Spending",
                value: formatCurrency(todaySpend, currency),
                percentChange: computePercentChange(todaySpend, data.today.previous),
                comparisonLabel: "yesterday",
            },
            {
                title: "This Week Spending",
                value: formatCurrency(weekSpend, currency),
                percentChange: computePercentChange(weekSpend, data.this_week.previous),
                comparisonLabel: "last week",
            },
            {
                title: "This Month Spending",
                value: formatCurrency(monthSpend, currency),
                percentChange: computePercentChange(monthSpend, data.this_month.previous),
                comparisonLabel: "last month",
            },
            {
                title: "Total transaction",
                value: totalTransaction.toString(),
            },
        ] satisfies Array<MetricItem>;
    }, [currency, data]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-background/60 backdrop-blur border-muted-foreground/20">
                        <CardHeader className="pb-2">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                            <div className="h-8 w-40 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-56 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                Failed to load dashboard: {(error as Error).message}
            </div>
        );
    }

    return (
        <div>
            <Header />
            <NetBalancePage />
            <div className="grid gap-4 grid-cols-4 m-8">
                {items.map((item) => (
                    <MetricCard key={item.title} {...item} />
                ))}

            </div>
            <CashflowOvertimePage />
            <Chart />
            <ChartPieLegend />
            <div className="px-8 pt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">Chart insights</p>
                <div className="flex gap-2 rounded-md border bg-card p-1">
                    {[
                        { id: "frequency", label: "Transaction Frequency" },
                        { id: "saving", label: "Saving Rate" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setChartTab(tab.id as "frequency" | "saving")}
                            className={cn(
                                "rounded-sm px-3 py-1 text-sm font-medium transition-colors",
                                chartTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className={chartTab === "frequency" ? "block" : "hidden"}>
                <BarTransactionFrequencyPage />
            </div>
            <div className={chartTab === "saving" ? "block" : "hidden"}>
                <SavingRatePage />
            </div>
            <Footer />
        </div>
    );
}
