'use client';

import { useState } from 'react';

import TransactionHeatmapPage from '@/components/pages/transaction-heatmap';
import ExpensesPage from '@/components/pages/transaction/transaction-table';

import TransactionRadar from '@/components/pages/bar-chart-radar';

export default function TransactionPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <>
      {/* <TransactionAveragePage /> */}
      <TransactionRadar />
      <TransactionHeatmapPage
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <ExpensesPage selectedDate={selectedDate} />
    </>
  );
}
