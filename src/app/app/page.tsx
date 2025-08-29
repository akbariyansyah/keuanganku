"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah } from "@/utils/formatter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";



// Fetch helper — no params; server decides timezone & type (OUT)
async function fetchSummary() {
  const res = await fetch(`/api/report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  const json = (await res.json()) as ReportSummaryResponse;
  return json.data;
}

export default function DashboardKpiCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", "summary", "spending"],
    queryFn: fetchSummary,
    staleTime: 60_000, // cache for 1 minute
    refetchOnWindowFocus: false,
  });


  const items = useMemo(() => {
    if (!data) return [] as Array<MetricItem>;
    const todaySpend = data.today.value;
    const weekSpend = data.this_week.value;
    const monthSpend = data.this_month.value;

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
      <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 m-8">
        {items.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}

      </div>
      <Footer />
    </div>
  );
}

type MetricItem = {
  title: string;
  value: string;
  delta: number | null; // positive = up, negative = down, null = hide badge

};

function MetricCard({ title, value, delta }: MetricItem) {
  return (
    <Card className="bg-background/60 backdrop-blur border-muted-foreground/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>

        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
