// components/table-skeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableRow, TableBody, TableCell } from '@/components/ui/table';

export default function TableSkeleton() {
  const hedaerCols = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-32',
    },
    {
      key: 'type',
      header: 'Type',
      width: 'w-32',
    },
    {
      key: 'amount',
      header: 'Amount',
      width: 'w-32',
    },
    {
      key: 'description',
      header: 'Description',
      width: 'w-32',
    },
    {
      key: 'created_at',
      header: 'Created At',
      width: 'w-32',
    },
  ];
  return (
    <div>
      <Table>
        <TableBody>
          {Array.from({ length: 10 }).map((_, rIdx) => (
            <TableRow key={rIdx} className="animate-pulse">
              {hedaerCols.map((c, cIdx) => (
                <TableCell key={cIdx}>
                  <Skeleton
                    className={[
                      'h-6',
                      c.width ?? 'w-24',
                      cIdx === 0 ? 'w-32' : '',
                      'rounded',
                    ].join(' ')}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
