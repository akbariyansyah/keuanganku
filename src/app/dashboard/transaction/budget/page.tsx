'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import { fetchBudgetAllocations } from '@/lib/fetcher/budget';

export default function BudgetPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [allocations, setAllocations] = useState<BudgetAllocationResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch allocations when month changes
  useEffect(() => {
    if (!selectedMonth) return;

    const loadAllocations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBudgetAllocations(selectedMonth);
        setAllocations(data);
      } catch (error) {
        console.error('Failed to fetch budget allocations:', error);
        setAllocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllocations();
  }, [selectedMonth]);

  const totalBudget = allocations.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddBudget = () => {
    router.push(`/dashboard/transaction/budget/add?month=${selectedMonth}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Budget Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your monthly budget allocations by category
          </p>
        </div>
        <Button onClick={handleAddBudget} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Budget
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Month
          </CardTitle>
          <CardDescription>
            Choose a month to view or edit budget allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border rounded-md w-full max-w-xs"
          />
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Budget</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(totalBudget)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {allocations.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-3xl">{allocations.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {allocations.length > 0 ? 'Budget allocated' : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average per Category</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                allocations.length > 0 ? totalBudget / allocations.length : 0,
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Mean allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocations</CardTitle>
          <CardDescription>
            {selectedMonth
              ? `Budget breakdown for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'Select a month to view allocations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : allocations.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Category</th>
                    <th className="p-3 text-left font-medium">Description</th>
                    <th className="p-3 text-right font-medium">Amount</th>
                    <th className="p-3 text-right font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => (
                    <tr key={allocation.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">
                        {allocation.category_name || 'Unknown'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {allocation.category_description || '-'}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(allocation.amount)}
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground">
                        {((allocation.amount / totalBudget) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 font-bold">
                    <td className="p-3" colSpan={2}>
                      Total
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(totalBudget)}
                    </td>
                    <td className="p-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No budget allocations found for this month
              </p>
              <Button onClick={handleAddBudget} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Budget Allocation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
