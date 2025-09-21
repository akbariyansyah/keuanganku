// Stable query keys for TanStack Query
export const qk = {
  me: ["me"] as const,
  histories: (interval: string | number) => ["histories", String(interval)] as const,
  reports: {
    summary: ["reports", "summary", "spending"] as const,
  },
  transactions: (page: number, limit: number) => ["transactions", page, limit] as const,
} as const;

