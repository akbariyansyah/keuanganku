'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  toPieChartData,
  extractMonthsFromPortfolio,
} from '@/utils/formatter';
import { CHART_VARS } from '@/constant/chart-color';
import Footer from '@/components/layout/footer';
import { Plus } from 'lucide-react';
import { PortfolioPieChart } from './PortfolioPieChart';

type PieChartData = { name: string; value: number };

export default function PortfolioPageSection() {
  const [allPortfolioData, setAllPortfolioData] = useState<PortfolioItem[]>(
    [],
  );
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

  // Fetch all portfolio data on mount
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchPortfolio();
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
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolio Allocation</h2>
        <Link href={'/dashboard/investment/portfolio/add'}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Portfolio
          </Button>
        </Link>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Select Month</label>
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
      </div>

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
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Total Value:{' '}
                <span className="font-semibold">
                  {monthTotal.toLocaleString()}
                </span>
              </p>
            </div>
            <PortfolioPieChart
              data={pieChartDataWithColor}
              config={chartConfig}
            />
          </div>

          {/* Right: Detail Section */}
          {filteredData.length > 0 && (
            <div className="w-full lg:w-[400px]">
              <h3 className="mb-4 text-2xl font-bold">Detail</h3>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-0"
              >
                {pieChartData.map((item, idx) => (
                  <AccordionItem key={item.name} value={`item-${idx}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-sm"
                          style={{
                            backgroundColor:
                              CHART_VARS[idx % CHART_VARS.length],
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Value:</span>{' '}
                          {item.value.toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Percentage:</span>{' '}
                          {((item.value / monthTotal) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
