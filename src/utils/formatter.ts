export function formatDate(
  dateString: string,
  options: { withTime?: boolean } = { withTime: true },
) {
  const date = new Date(dateString);

  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', // add day name
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(options?.withTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    timeZone: 'Asia/Jakarta',
  }).format(date);

  // Remove "pukul" and trim spaces
  return formatted.replace('pukul', '').trim();
}

// Get stable month key + pretty label in Asia/Jakarta
const monthInfo = (iso: string) => {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    month: 'long',
  }).format(d);
  return { key: `${year}-${month}`, label, year }; // e.g. "2025-10", "October", "2025"
};

export function toChartData(rows: PortfolioItem[]) {
  const byMonth = new Map<string, Record<string, number | string>>();
  const monthOrder: string[] = [];
  const categories = new Set<string>();

  for (const r of rows) {
    const { key, label, year } = monthInfo(r.date);

    if (!byMonth.has(key)) {
      byMonth.set(key, { month: `${label} ${year}` });
      monthOrder.push(key); // preserve API order
    }

    const obj = byMonth.get(key)!;
    const cat = r.name;
    categories.add(cat);

    const val = Number(r.total || 0);
    obj[cat] = ((obj[cat] as number | undefined) ?? 0) + val;
  }

  const cats = [...categories];

  const result = monthOrder.map((key) => {
    const obj = byMonth.get(key)!;
    for (const c of cats) if (obj[c] == null) obj[c] = 0;
    return obj as { month: string } & Record<string, number>;
  });

  return result;
}

export const formatNumber = (value?: number) => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumber = (value: string) => {
  return Number(value.replace(/\./g, '')) || 0;
};
