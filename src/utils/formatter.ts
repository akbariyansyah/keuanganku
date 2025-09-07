export function formatRupiah(amount: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", // add day name
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);

  // Remove "pukul" and trim spaces
  return formatted.replace("pukul", "").trim();
}


export const formatNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);