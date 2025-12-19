'use client';

import { useState } from 'react';

import TransactionHeatmapPage from '@/section/transaction/transaction/chart/transaction-heatmap';
import ExpensesPage from '@/section/transaction/transaction/transaction-table';

import TransactionRadar from '@/components/pages/transaction-radar';
import BarTransactionFrequencyPage from '@/section/transaction/transaction/chart/bar-transaction-frequency';
import SavingRatePage from '@/section/transaction/transaction/chart/saving-rate';
import { cn } from '@/lib/utils';

export default function TransactionPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chartTab, setChartTab] = useState<'frequency' | 'saving' | 'radar'>(
    'frequency',
  );
  return (
    <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-8 pt-4">
        <p className="text-xl font-bold text-shadow-muted-foreground">
          Transaction Statistics
        </p>
        <div className="flex gap-2 rounded-md border bg-card p-1">
          {[
            { id: 'frequency', label: 'Transaction Frequency' },
            { id: 'radar', label: 'Transaction Radar' },
            { id: 'saving', label: 'Saving Rate' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setChartTab(tab.id as 'frequency' | 'saving' | 'radar')
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
