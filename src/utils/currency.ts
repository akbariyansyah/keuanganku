export type CurrencyCode = 'IDR' | 'USD';

export const DEFAULT_CURRENCY: CurrencyCode = 'IDR';
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['IDR', 'USD'];
export const IDR_PER_USD = 16400;

const CONVERSION_RATE_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 1 / IDR_PER_USD,
};

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  IDR: 'id-ID',
  USD: 'en-US',
};

const FRACTION_DIGITS: Record<
  CurrencyCode,
  { minimum: number; maximum: number }
> = {
  IDR: { minimum: 0, maximum: 0 },
  USD: { minimum: 2, maximum: 2 },
};

function normalizeAmount(amount: number | string | null | undefined): number {
  if (amount == null) {
    return 0;
  }

  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  return Number.isFinite(numeric) ? numeric : 0;
}

export function convertIdrTo(
  amountInIdr: number | string,
  currency: CurrencyCode,
): number {
  const amount = normalizeAmount(amountInIdr);
  return amount * CONVERSION_RATE_FROM_IDR[currency];
}

export function convertToIdr(
  amount: number | string,
  currency: CurrencyCode,
): number {
  const amountValue = normalizeAmount(amount);

  if (currency === 'USD') {
    return amountValue * IDR_PER_USD;
  }

  return amountValue;
}

export function formatCurrency(
  amountInIdr: number | string,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const converted = convertIdrTo(amountInIdr, currency);
  const { minimum, maximum } = FRACTION_DIGITS[currency];

  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: minimum,
    maximumFractionDigits: maximum,
  }).format(converted);
}

export function formatWithCode(
  amountInIdr: number | string,
  currency: CurrencyCode,
): string {
  const converted = convertIdrTo(amountInIdr, currency);
  const formatted = converted.toLocaleString(LOCALE_BY_CURRENCY[currency], {
    minimumFractionDigits: FRACTION_DIGITS[currency].minimum,
    maximumFractionDigits: FRACTION_DIGITS[currency].maximum,
  });

  return `${currency} ${formatted}`;
}
