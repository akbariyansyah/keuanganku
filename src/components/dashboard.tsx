"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah } from "@/utils/formatter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Chart } from "@/components/chart";
import { ChartPieLegend } from "@/components/chart-pie-with-legend";
import { fetchReport } from "@/lib/fetcher/api";
import { qk } from "@/lib/react-query/keys";

import MetricCard, { MetricItem } from "@/components/metric-card";

export default function DashboardKpiCards() {
    const { data, isLoading, error } = useQuery({
        queryKey: qk.reports.summary,
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
                value: formatRupiah(todaySpend),
                delta: null

            },
            {
                title: "This Week Spending",
                value: formatRupiah(weekSpend),
                delta: null

            },
            {
                title: "This Month Spending",
                value: formatRupiah(monthSpend),
                delta: null,
            },
            {
                title: "Total transaction",
                value: totalTransaction.toString(),
                delta: null,
            },
        ] satisfies Array<MetricItem>;
    }, [data]);

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
            <div className="grid gap-4 grid-cols-4 m-8">
                {items.map((item) => (
                    <MetricCard key={item.title} {...item} />
                ))}

            </div>
            <Chart />
            <ChartPieLegend />
            <Footer />
        </div>
    );
}
