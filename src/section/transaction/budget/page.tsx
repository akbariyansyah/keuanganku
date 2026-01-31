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
import { Plus, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import {
  fetchBudgetAllocations,
  fetchBudgetComparison,
} from '@/lib/fetcher/budget';
import { Pie, PieChart, Cell, Legend, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/utils/currency';

export default function BudgetSection() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [allocations, setAllocations] = useState<BudgetAllocationResponse[]>(
    [],
  );
  const [comparison, setComparison] = useState<BudgetComparisonResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch allocations and comparison when month changes
  useEffect(() => {
    if (!selectedMonth) return;

    const loadBudgetData = async () => {
      setIsLoading(true);
      try {
        const [allocData, compData] = await Promise.all([
          fetchBudgetAllocations(selectedMonth),
          fetchBudgetComparison(selectedMonth),
        ]);
        setAllocations(allocData);
        setComparison(compData);
      } catch (error) {
        console.error('Failed to fetch budget data:', error);
        setAllocations([]);
        setComparison(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgetData();
  }, [selectedMonth]);

  const totalBudget = allocations.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const handleAddBudget = () => {
    router.push(`/dashboard/transaction/budget/add?month=${selectedMonth}`);
  };

  // Prepare pie chart data
  const pieChartData = comparison
    ? [
        {
          name: 'Planned',
          value: comparison.plannedTotal,
          fill: 'var(--chart-7)',
        },
        {
          name: 'Actual',
          value: comparison.actualTotal,
          fill: 'var(--chart-2)',
        },
      ]
    : [];

  const isOverBudget =
    comparison && comparison.actualTotal > comparison.plannedTotal;
  const varianceAmount = comparison ? Math.abs(comparison.variance) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Overview</h1>
          <p className="text-muted-foreground mt-1">
            Compare your planned budget vs actual spending
          </p>
        </div>
        <Button onClick={handleAddBudget} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left: Month Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Period
            </CardTitle>
            <CardDescription>
              Choose a month to view budget comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded-md w-full"
            />
          </CardContent>
        </Card>

        {/* Right: Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Planned vs Actual</CardTitle>
            <CardDescription>
              {selectedMonth
                ? `Budget comparison for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                : 'Select a month to view comparison'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : comparison && comparison.plannedTotal > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <ChartContainer
                    config={{
                      planned: {
                        label: 'Planned',
                        color: 'hsl(var(--chart-1))',
                      },
                      actual: {
                        label: 'Actual',
                        color: 'hsl(var(--chart-4))',
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) =>
                          `${entry.name}: ${((entry.value / (comparison.plannedTotal + comparison.actualTotal)) * 100).toFixed(1)}%`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Planned Budget
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(comparison.plannedTotal)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Actual Spending
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(comparison.actualTotal)}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2">
                      {isOverBudget ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      <p className="text-sm font-medium">
                        {isOverBudget ? 'Over Budget' : 'Under Budget'}
                      </p>
                    </div>
                    <p
                      className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {formatCurrency(varianceAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparison.variancePercent}% of planned budget used
                    </p>
                  </div>
                </div>
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
                    <th className="p-3 text-right font-medium">Planned</th>
                    <th className="p-3 text-right font-medium">Actual</th>
                    <th className="p-3 text-right font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => {
                    const actualItem = comparison?.actualByCategory.find(
                      (a) => a.categoryId === allocation.category_id,
                    );
                    const actualAmount = actualItem?.amount || 0;
                    const variance = allocation.amount - actualAmount;
                    const isOver = actualAmount > allocation.amount;

                    return (
                      <tr
                        key={allocation.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-medium">
                          {allocation.category_name || 'Unknown'}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {allocation.category_description || '-'}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(allocation.amount)}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(actualAmount)}
                        </td>
                        <td
                          className={`p-3 text-right font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {isOver ? '-' : '+'}
                          {formatCurrency(Math.abs(variance))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 font-bold">
                    <td className="p-3" colSpan={2}>
                      Total
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(totalBudget)}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(comparison?.actualTotal || 0)}
                    </td>
                    <td
                      className={`p-3 text-right ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {isOverBudget ? '-' : '+'}
                      {formatCurrency(varianceAmount)}
                    </td>
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
