'use client';

import { useState } from 'react';

import TransactionHeatmapPage from '@/components/pages/transaction-heatmap';
import ExpensesPage from '@/components/pages/transaction/transaction-table';
import TransactionAveragePage from '@/components/pages/transaction-average';
import RadarTransactionChartPage from '@/components/pages/radar-transaction-chart';
import TransactionRadar from '@/components/pages/bar-chart-radar';

export default function TransactionPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <>
      <TransactionAveragePage />
      {/* <RadarTransactionChartPage /> */}
      <TransactionRadar />
      <TransactionHeatmapPage
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <ExpensesPage selectedDate={selectedDate} />
    </>
  );
}
