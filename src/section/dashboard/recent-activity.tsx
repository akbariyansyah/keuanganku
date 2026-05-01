'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTransactions } from '@/lib/fetcher/transaction';
import { qk } from '@/lib/react-query/keys';
import { useUiStore } from '@/store/ui';
import { formatCurrency } from '@/utils/currency';
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/utils/formatter';
import { useRouter } from 'next/navigation';

export function RecentActivity() {
  const currency = useUiStore((state) => state.currency);
  const router = useRouter();
  const onclick = () => {
    router.push('/dashboard/transaction/list');
  };

  const { data, isLoading } = useQuery({
    queryKey: qk.transactions(1, 5),
    queryFn: () => fetchTransactions({ limit: 5, page: 1 }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const transactions = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="my-6 border border-muted-foreground/20 backdrop-blur bg-card h-fit">
        <CardHeader className="border-b pb-4">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border border-muted-foreground/20 backdrop-blur bg-card h-fit">
      <CardHeader className="border-b pb-2">
        <CardTitle className="flex justify-between mb-4">
          <h3>Recent Activity</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium truncate text-sm cursor-pointer">
                <button onClick={onclick}>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
              </p>
            </TooltipTrigger>
            <TooltipContent>View all transactions</TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recent transactions
          </p>
        ) : (
          <div className="space-y-1.5">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 rounded-lg border border-muted-foreground/10 p-3 hover:bg-accent/50 transition-colors"
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                    transaction.type === 'IN'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'IN' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-medium truncate text-sm cursor-pointer">
                        {transaction.description || 'No description'}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {transaction.description || 'No description'}
                    </TooltipContent>
                  </Tooltip>

                  <p className="text-xs text-muted-foreground">
                    {transaction.category_name} •{' '}
                    {formatDate(transaction.created_at, {
                      withTime: false,
                      variant: 'short',
                    })}
                  </p>
                </div>
                <div
                  className={`font-semibold text-sm text-right flex-shrink-0 ${
                    transaction.type === 'IN'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'IN' ? '+' : '−'}
                  {formatCurrency(transaction.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
