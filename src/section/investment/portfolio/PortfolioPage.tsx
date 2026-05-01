'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPortfolio } from '@/lib/fetcher/api';
import { toPieChartData, extractMonthsFromPortfolio } from '@/utils/formatter';
import { CHART_VARS } from '@/constant/chart-color';
import Footer from '@/components/layout/footer';
import { Plus } from 'lucide-react';
import { PortfolioPieChart } from './PortfolioPieChart';
import AssetCategoryAccordion from './AssetCategoryAccordion';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';
import { Separator } from '@/components/ui/separator';

export default function PortfolioPageSection() {
  const [allPortfolioData, setAllPortfolioData] = useState<PortfolioItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract available months for dropdown
  const availableMonths = useMemo(
    () => extractMonthsFromPortfolio(allPortfolioData),
    [allPortfolioData],
  );

  // Filter data by selected month
  const filteredData = useMemo(() => {
    if (!selectedMonth) return [];
    return allPortfolioData.filter((item) => {
      const itemMonth = item.date.substring(0, 7); // Get YYYY-MM
      return itemMonth === selectedMonth;
    });
  }, [allPortfolioData, selectedMonth]);

  // Transform filtered data for pie chart
  const pieChartData = useMemo(
    () => toPieChartData(filteredData),
    [filteredData],
  );

  // Generate chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const base: ChartConfig = {};
    pieChartData.forEach((item, idx) => {
      base[item.name] = {
        label: item.name,
        color: CHART_VARS[idx % CHART_VARS.length],
      };
    });
    return base;
  }, [pieChartData]);

  // Add color to pie chart data
  const pieChartDataWithColor = useMemo(
    () =>
      pieChartData.map((item, idx) => ({
        ...item,
        fill: CHART_VARS[idx % CHART_VARS.length],
      })),
    [pieChartData],
  );

  const currency = useUiStore((state) => state.currency);

  // Fetch all portfolio data on mount
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchPortfolio(undefined, true);
      setAllPortfolioData(res ?? []);

      // Auto-select the most recent month
      if (res && res.length > 0) {
        const months = extractMonthsFromPortfolio(res);
        if (months.length > 0) {
          setSelectedMonth(months[0].value);
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate total for selected month
  const monthTotal = useMemo(
    () => pieChartData.reduce((sum, item) => sum + item.value, 0),
    [pieChartData],
  );

  return (
    <div className="p-2 sm:px-4 w-full">
      <div className=" mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Portfolio Allocation</h2>
        <div className="flex justify-end gap-6">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href={'/dashboard/investment/portfolio/add'}>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Portfolio
            </Button>
          </Link>
        </div>
      </div>
      <Separator />

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Chart and Detail Section - Side by Side */}
      {!isLoading && !error && selectedMonth && (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left: Pie Chart */}
          <div className="flex-1">
            <div className="mb-4"></div>
            <PortfolioPieChart
              data={pieChartDataWithColor}
              config={chartConfig}
            />
          </div>

          {/* Right: Detail Section */}
          <div className="flex-1">
            <AssetCategoryAccordion
              items={filteredData}
              isLoading={isLoading}
              error={error}
              chartColors={CHART_VARS}
              currency={currency}
              onRetry={fetchData}
            />
            {filteredData.length > 0 && (
              <p className="text-sm text-muted-foreground mt-6">
                Total Value:{' '}
                <span className="font-semibold">
                  {formatCurrency(monthTotal, currency)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
      <div className="mt-30">
        <Footer />
      </div>
    </div>
  );
}
