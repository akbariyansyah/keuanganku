'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchPortfolio } from '@/lib/fetcher/api';
import { toChartData } from '@/utils/formatter';
import { CHART_VARS } from '@/constant/chart-color';
import Footer from '@/components/layout/footer';

type ChartRow = { month: string } & Record<string, number>;

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<ChartRow[]>([]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    portfolio.forEach((row) => {
      Object.entries(row).forEach(([key, val]) => {
        if (key !== 'month' && typeof val === 'number') set.add(key);
      });
    });
    return Array.from(set);
  }, [portfolio]);

  const chartConfig: ChartConfig = useMemo(() => {
    const base: ChartConfig = {};
    categories.forEach((cat, idx) => {
      base[cat] = { label: cat, color: CHART_VARS[idx % CHART_VARS.length] };
    });
    return base;
  }, [categories]);

  const fetchData = async () => {
    try {
      const res = await fetchPortfolio();
      setPortfolio(toChartData(res ?? []));
    } catch (err) {
      console.log('error happened', err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
      <ChartContainer config={chartConfig} className="min-h-[500px] w-full">
        <BarChart accessibilityLayer data={portfolio} barSize={40}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis width={150} tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend
            content={<ChartLegendContent nameKey="month" payload={undefined} />}
          />
          {categories.map((cat, idx) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="allocation"
              fill={CHART_VARS[idx % CHART_VARS.length]}
              radius={
                idx === categories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ChartContainer>
      <Link className="mr-4" href={'/dashboard/investment/portfolio/add'}>
        <Button className="w-[100]">Add</Button>
      </Link>
      <h1 className="text-2xl font-bold mt-4">Detail</h1>
      <Accordion
        type="single"
        collapsible
        className="w-full mt-4"
        defaultValue="item-1"
      >
        {portfolio.map((item) => (
          <AccordionItem key={item.month} value={`item-${item.month}`}>
            <AccordionTrigger>{item.month}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>Value: {item.total ?? 0}</p>
              <pre className="text-xs">{JSON.stringify(item, null, 2)}</pre>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Footer />
    </div>
  );
}
