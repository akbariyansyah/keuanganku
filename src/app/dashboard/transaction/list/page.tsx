'use client';

import { useState } from 'react';

import TransactionHeatmapPage from '@/section/transaction/transaction/chart/transaction-heatmap';
import ExpensesPage from '@/section/transaction/transaction/transaction-table';

import TransactionRadar from '@/section/transaction/transaction/chart/bar-transaction-radar';
import BarTransactionFrequencyPage from '@/section/transaction/transaction/chart/bar-transaction-frequency';
import SavingRatePage from '@/section/transaction/transaction/chart/saving-rate';
import { cn } from '@/lib/utils';
import BarTransactionAveragePage from '@/section/transaction/transaction/chart/bar-transaction-average';
import { useQuery } from '@tanstack/react-query';
import { fetchAverageSpending } from '@/lib/fetcher/report';
import { qk } from '@/lib/react-query/keys';

export default function TransactionPage() {
  const { data: dataAverage } = useQuery({
    queryKey: qk.reports.averageSpending,
    queryFn: fetchAverageSpending,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chartTab, setChartTab] = useState<
    'frequency' | 'saving' | 'radar' | 'average'
  >('frequency');
  return (
    <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-8 pt-4">
        <p className="text-xl font-bold text-shadow-muted-foreground">
          Transaction Statistics
        </p>
        <div className="flex gap-2 rounded-md border bg-card p-1">
          {[
            { id: 'frequency', label: 'Frequency' },
            { id: 'average', label: 'Average' },
            { id: 'radar', label: 'Radar' },
            { id: 'saving', label: 'Saving Rate' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setChartTab(
                  tab.id as 'frequency' | 'saving' | 'radar' | 'average',
                )
              }
              className={cn(
                'rounded-sm px-3 py-1 text-sm font-medium transition-colors',
                chartTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={chartTab === 'frequency' ? 'block' : 'hidden'}>
        <BarTransactionFrequencyPage />
      </div>
      <div className={chartTab === 'saving' ? 'block' : 'hidden'}>
        <SavingRatePage />
      </div>
      <div className={chartTab === 'average' ? 'block' : 'hidden'}>
        <BarTransactionAveragePage averageTransaction={dataAverage} />
      </div>
      <div className={chartTab === 'radar' ? 'block' : 'hidden'}>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-0">
            <TransactionRadar />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-0">
          <TransactionHeatmapPage
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            averageSpending={dataAverage}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-0">
          <ExpensesPage selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
