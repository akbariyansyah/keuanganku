'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoryInvestmentPageTable from '@/section/investment/performance/history-page-table';
import PerformanceChartPage from '@/section/investment/performance/performance-chart';
import { AppWindowIcon, TableIcon } from 'lucide-react';

export default function ChartAreaInteractive() {
  return <div className='px-2'>
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">
          <AppWindowIcon />
          Summary
        </TabsTrigger>
        <TabsTrigger value="code">
          <TableIcon />
          History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <PerformanceChartPage />
      </TabsContent>
      <TabsContent value="code">
        <HistoryInvestmentPageTable />
      </TabsContent>
    </Tabs>
  </div>
    ;
}
