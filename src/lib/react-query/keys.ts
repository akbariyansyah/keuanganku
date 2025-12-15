// Stable query keys for TanStack Query
export const qk = {
  me: ['me'] as const,
  histories: (interval: string | number) =>
    ['histories', String(interval)] as const,
  reports: {
    kpi: ['reports', 'kpi'] as const,
    categorySummary: (interval: string | number) =>
      ['reports', 'category-summary', String(interval)] as const,
    transactionFrequency: (start?: string, end?: string) =>
      ['reports', 'transaction-frequency', start ?? '', end ?? ''] as const,
    savingRate: ['reports', 'saving-rate'] as const,
    cashflowOvertime: ['reports', 'cashflow-overtime'] as const,
    averageSpending: ['reports', 'average-spending'] as const,
    categoryRadar: ['reports', 'category-radar'] as const,
  },
  transactionHeatmap: (year?: string | number) =>
    ['transactions', 'heatmap', year ?? 'latest'] as const,
  transactions: (page: number, limit: number) =>
    ['transactions', page, limit] as const,
  investments: {
    performance: ['investments', 'performance'] as const,
    performanceLevels: ['investments', 'performance-levels'] as const,
    performanceCards: ['investments', 'performance-cards'] as const,
    anomaly: ['anomaly'] as const,
  },
} as const;
