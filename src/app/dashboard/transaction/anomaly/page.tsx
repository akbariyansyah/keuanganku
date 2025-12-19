'use client';

import AnomalyCenter from '@/section/transaction/anomaly/table-anomaly';
import AnomalyScatterChart from '@/section/transaction/anomaly/scatter-plot';

export default function AnomalyPage() {
  return (
    <div>
      <AnomalyScatterChart />
      <AnomalyCenter />
    </div>
  );
}
