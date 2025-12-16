import { formatCurrency } from '@/utils/currency';

export function formatRupiah(amount: number | string) {
  return formatCurrency(amount, 'IDR');
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', // add day name
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);

  // Remove "pukul" and trim spaces
  return formatted.replace('pukul', '').trim();
}

export const formatNum = (n: number) =>
  new Intl.NumberFormat('id-ID').format(n);

export function toChartData(rows: PortfolioItem[]) {
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

  const byMonth = new Map<string, Record<string, number | string>>();
  const categories = new Set<string>();

  for (const r of rows) {
    const { key, label, year } = monthInfo(r.date);
    const obj = byMonth.get(key) ?? { month: `${label} ${year}` };
    const cat = r.name; // keep original names as series keys
    categories.add(cat);
    const val = typeof r.total === 'number' ? r.total : Number(r.total || 0);
    obj[cat] = ((obj[cat] as number | undefined) ?? 0) + val;
    byMonth.set(key, obj);
  }

  // Ensure all months have all category keys
  const cats = [...categories];
  const result = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, obj]) => {
      for (const c of cats) if (obj[c] == null) obj[c] = 0;
      return obj as { month: string } & Record<string, number>;
    });

  console.log('Portfolio chart data:', result);
  return result;
}
