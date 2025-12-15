export default function computePercentChange(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return ((current - previous) / previous) * 100;
}
