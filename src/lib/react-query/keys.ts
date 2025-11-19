// Stable query keys for TanStack Query
export const qk = {
  me: ["me"] as const,
  histories: (interval: string | number) => ["histories", String(interval)] as const,
  reports: {
    kpi: ["reports", "kpi"] as const,
    categorySummary: (interval: string | number)=> ["reports", "category-summary", String(interval)] as const,
    transactionFrequency: (start?: string, end?: string) =>
      ["reports", "transaction-frequency", start ?? "", end ?? ""] as const,
    savingRate: ["reports", "saving-rate"] as const,
    cashflowOvertime: ["reports", "cashflow-overtime"] as const,
  },
  transactions: (page: number, limit: number) => ["transactions", page, limit] as const,
  investments: {
    performance: ["investments", "performance"] as const,
  },
} as const;
