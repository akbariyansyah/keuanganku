"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { qk } from "@/lib/react-query/keys"
import { fetchTransactionAnomaly } from "@/lib/fetcher/transaction"
import { formatDate } from "@/utils/formatter"

export type Anomaly = {
    id: string
    name: string
    amount: number
    deviation_percent: number
    severity: "low" | "medium" | "high"
    last_transaction_at: string
}

const anomalies: Anomaly[] = [
    {
        id: "1",
        name: "Food & Drinks",
        amount: 982000,
        deviation_percent: 65,
        severity: "high",
        last_transaction_at: "This week",
    },
]

export default function AnomalyCenter() {

    const { data = [], isLoading, error } = useQuery<Anomaly[]>({
        queryKey: qk.investments.anomaly,
        queryFn: fetchTransactionAnomaly,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })
    return (
        <div className="space-y-4">
            {/* Summary */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Anomaly Center</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Deteksi pola pengeluaran yang beda dari biasanya.
                        </p>
                    </div>
                    <Badge variant="outline">
                        {data.length} anomaly bulan ini
                    </Badge>
                </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                </TabsList>

                {/* List view */}
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detected anomalies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="max-h-[420px] pr-4">
                                <div className="space-y-3">
                                    {data.map((a) => (
                                        <div
                                            key={a.last_transaction_at}
                                            className="flex items-center justify-between rounded-xl border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {a.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(a.last_transaction_at)} • deviasi {a.deviation_percent}%
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        a.severity === "high"
                                                            ? "destructive"
                                                            : a.severity === "medium"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {a.severity.toUpperCase()}
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    View details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Heatmap / Chart view (isi sendiri) */}
                <TabsContent value="heatmap">
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Tempatkan komponen chart/heatmap kustom di sini */}
                            <div className="h-[260px] rounded-lg border border-dashed" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
