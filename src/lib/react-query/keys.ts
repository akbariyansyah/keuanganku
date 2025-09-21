// Stable query keys for TanStack Query
export const qk = {
  me: ["me"] as const,
  histories: (interval: string | number) => ["histories", String(interval)] as const,
  reports: {
    kpi: ["reports", "kpi"] as const,
    categorySummary: ["reports", "category-summary"] as const,
  },
  transactions: (page: number, limit: number) => ["transactions", page, limit] as const,
} as const;
