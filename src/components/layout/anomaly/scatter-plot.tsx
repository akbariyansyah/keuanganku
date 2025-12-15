'use client';

import { useUiStore } from '@/store/ui';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatter';
import { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ReportEntry = {
  id: string;
  amount: number;
  created_at: string;
  category_id: string;
  is_anomaly: boolean;
};

export default function AnomalyReportScatter() {
  const [data, setData] = useState<ReportEntry[]>([]);
  const currency = useUiStore((state) => state.currency);
  useEffect(() => {
    fetch('/api/transaction/anomaly/report')
      .then((res) => res.json())
      .then((json) => {
        const mapped = json.data.map((d: ReportEntry) => ({
          ...d,
          x: new Date(d.created_at).getTime(),
          y: d.amount,
        }));
        setData(mapped);
      })
      .catch((err) => console.error('fetch error:', err));
  }, []);

  return (
    <div className="w-full h-[450px] p-2 mb-20">
      <h2 className="text-lg font-semibold mb-3 p-4">
        Income / Expense Anomaly Scatter Plot
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />

          {/* X = waktu */}
          <XAxis
            type="number"
            dataKey="x"
            name="Date"
            tickFormatter={(unix) => new Date(unix).toLocaleDateString()}
            domain={['auto', 'auto']}
          />

          {/* Y = amount */}
          <YAxis
            type="number"
            dataKey="y"
            scale="log"
            domain={['auto', 'auto']}
            tickFormatter={(v) => v.toLocaleString('id-ID')}
          />

          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const d = payload[0].payload;

              return (
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {formatDate(d.created_at)}
                  </div>

                  <div>Amount: {formatCurrency(d.y, currency)}</div>
                  <div>Category: {d.category_id}</div>

                  {d.is_anomaly && (
                    <div
                      style={{
                        color: '#630404',
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      ⚠ Anomaly detected
                    </div>
                  )}
                </div>
              );
            }}
          />

          {/* Normal transactions */}
          <Scatter
            data={data.filter((d) => !d.is_anomaly)}
            fill="#207018"
            name="Normal"
            opacity={0.6}
          />

          {/* Anomaly transactions */}
          <Scatter
            data={data.filter((d) => d.is_anomaly)}
            fill="#4A90E2"
            name="Anomaly"
            shape="circle"
            r={7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
