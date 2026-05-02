import MetricCard, { MetricItem } from '@/components/common/metric-card';
import { useMemo } from 'react';
import { TableHistoryInvestment } from './table-history';

export default function HistoryInvestmentPageTable() {
  const items = useMemo(() => {
    return [
      {
        title: 'Total withdrawn',
        value: '12121212',
      },
      {
        title: 'Number of withdrawals',
        value: '23',
      },
      {
        title: 'Last withdrawal',
        value: '23',
      },
    ] satisfies Array<MetricItem>;
  }, []);

  return (
    <div>
      <div className="p-2">
        <h3 className="text-xl font-bold">History Page</h3>
      </div>

      {/* Metrics Cards */}
      <div className="grid w-full gap-2 my-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item, idx) => {
          return <MetricCard key={idx} title={item.title} value={item.value} />;
        })}
      </div>

      {/* Table */}
      <TableHistoryInvestment />
    </div>
  );
}
