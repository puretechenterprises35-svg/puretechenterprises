// Application-wide currency configuration.
// To add support for a new currency, add it to SUPPORTED_CURRENCIES.
// To change the default currency, update DEFAULT_CURRENCY.

export type CurrencyCode = "ZMW" | "USD" | "GBP" | "EUR" | "KES";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ZMW: { code: "ZMW", symbol: "ZMW", label: "Zambian Kwacha (ZMW)" },
  USD: { code: "USD", symbol: "USD", label: "US Dollar (USD)" },
  GBP: { code: "GBP", symbol: "GBP", label: "British Pound (GBP)" },
  EUR: { code: "EUR", symbol: "EUR", label: "Euro (EUR)" },
  KES: { code: "KES", symbol: "KES", label: "Kenyan Shilling (KES)" },
};

export const DEFAULT_CURRENCY: CurrencyCode = "ZMW";

export function getCurrency(code?: string | null): CurrencyConfig {
  if (!code) return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  return (
    SUPPORTED_CURRENCIES[code as CurrencyCode] ??
    SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
  );
}

export function formatCurrency(
  amount: number | null | undefined,
  currency?: string | null,
  options: Intl.NumberFormatOptions = {}
): string {
  const cfg = getCurrency(currency);
  const value = Number(amount ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
  return `${cfg.symbol} ${value}`;
}
