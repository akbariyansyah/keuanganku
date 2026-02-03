'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/react-query/keys';
import { fetchTransactionAnomaly } from '@/lib/fetcher/transaction';
import { formatDate } from '@/utils/formatter';
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';

export type Anomaly = {
  category_id: number;
  name: string;
  amount: number;
  deviation_percent: number;
  severity: 'low' | 'medium' | 'high';
  last_transaction_at: string;
};

export default function AnomalyCenter() {
  const currency = useUiStore((state) => state.currency);
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Anomaly[]>({
    queryKey: qk.investments.anomaly,
    queryFn: fetchTransactionAnomaly,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [headerName, setHeaderName] = useState<string>('');
  const { data: detailData = [], isLoading: isDetailLoading } = useQuery({
    queryKey: ['anomaly-detail', selectedCategoryId],
    queryFn: () =>
      fetch(`/api/transaction/anomaly/${selectedCategoryId}`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !!selectedCategoryId, // only fetch when categoryId is set
  });

  return (
    <div className="space-y-3 sm:space-y-4 m-2 sm:m-4">
      {/* Summary */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">Anomali Center</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-4">
              Deteksi pola pengeluaran yang beda dari biasanya.
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-xs sm:text-sm">
            {data.length} anomaly bulan ini
          </Badge>
        </CardHeader>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Detail transaksi {headerName}
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Loading...
            </p>
          ) : detailData.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tidak ada transaksi di kategori ini.
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto mt-3 sm:mt-5">
              {detailData.map((t: any) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"
                >
                  <div>
                    <p className="font-medium text-xs sm:text-sm">
                      {t.description}
                    </p>
                    <Badge
                      className="my-1 sm:my-2 text-xs"
                      variant={t.type === 'OUT' ? 'destructive' : 'secondary'}
                    >
                      {t.type}
                    </Badge>
                  </div>
                  <div className="sm:ml-auto sm:text-right">
                    <p className="font-medium text-xs sm:text-sm">
                      {formatCurrency(t.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-3 sm:space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="list" className="flex-1 sm:flex-none text-sm">
            List
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex-1 sm:flex-none text-sm">
            Heatmap
          </TabsTrigger>
        </TabsList>

        {/* List view */}
        <TabsContent value="list">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Detected anomalies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ScrollArea className="max-h-[350px] sm:max-h-[420px] pr-2 sm:pr-4">
                <div className="space-y-2 sm:space-y-3">
                  {data.map((a) => (
                    <div
                      key={a.last_transaction_at}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(a.last_transaction_at)} • deviasi{' '}
                          {a.deviation_percent}%
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-2 sm:gap-3">
                        <Badge
                          variant={
                            a.severity === 'high'
                              ? 'destructive'
                              : a.severity === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {a.severity.toUpperCase()}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => {
                            setSelectedCategoryId(a.category_id);
                            setHeaderName(a.name);
                            setOpen(true);
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Spending heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Tempatkan komponen chart/heatmap kustom di sini */}
              <div className="h-[200px] sm:h-[260px] rounded-lg border border-dashed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
