"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { qk } from "@/lib/react-query/keys"
import { fetchTransactionAnomaly } from "@/lib/fetcher/transaction"
import { formatDate } from "@/utils/formatter"
import { useState } from "react"
import { formatCurrency } from "@/utils/currency"
import { useUiStore } from "@/store/ui"

export type Anomaly = {
    category_id: number
    name: string
    amount: number
    deviation_percent: number
    severity: "low" | "medium" | "high"
    last_transaction_at: string
}

const anomalies: Anomaly[] = [
    {
        category_id: 1,
        name: "Food & Drinks",
        amount: 982000,
        deviation_percent: 65,
        severity: "high",
        last_transaction_at: "This week",
    },
]

export default function AnomalyCenter() {

    const currency = useUiStore((state) => state.currency)
    const { data = [], isLoading, error } = useQuery<Anomaly[]>({
        queryKey: qk.investments.anomaly,
        queryFn: fetchTransactionAnomaly,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })

    const [open, setOpen] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
const [headerName, setHeaderName] = useState<string>("");
    const { data: detailData = [], isLoading: isDetailLoading } = useQuery({
        queryKey: ["anomaly-detail", selectedCategoryId],
        queryFn: () => fetch(`/api/transaction/anomaly/${selectedCategoryId}`).then((r) => r.json()).then((r) => r.data),
        enabled: !!selectedCategoryId, // only fetch when categoryId is set
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail transaksi {headerName}</DialogTitle>
                    </DialogHeader>

                    {isDetailLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : detailData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada transaksi di kategori ini.</p>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {detailData.map((t: any) => (
                                <div key={t.id} className="border rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">{t.description}</p>
                                    </div>
                                    <div>
                                        
                                        <p className="font-medium text-sm">{formatCurrency(t.amount, currency)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(t.created_at)}
                                        </p>
                                    </div>
                                    <Badge variant={t.transaction_type === "OUT" ? "destructive" : "secondary"}>
                                        {t.transaction_type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCategoryId(a.category_id)
                                                        setHeaderName(a.name);
                                                        setOpen(true)
                                                    }}
                                                >
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
