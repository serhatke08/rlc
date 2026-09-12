export type MarketCurrency = {
  code: string;
  symbol: string;
  label: string;
};

const COUNTRY_CURRENCY: Record<string, MarketCurrency> = {
  GB: { code: "GBP", symbol: "£", label: "GBP" },
  TR: { code: "TRY", symbol: "₺", label: "TL" },
  US: { code: "USD", symbol: "$", label: "USD" },
  DE: { code: "EUR", symbol: "€", label: "EUR" },
  FR: { code: "EUR", symbol: "€", label: "EUR" },
  IT: { code: "EUR", symbol: "€", label: "EUR" },
  ES: { code: "EUR", symbol: "€", label: "EUR" },
  NL: { code: "EUR", symbol: "€", label: "EUR" },
  BE: { code: "EUR", symbol: "€", label: "EUR" },
  AT: { code: "EUR", symbol: "€", label: "EUR" },
  IE: { code: "EUR", symbol: "€", label: "EUR" },
  PT: { code: "EUR", symbol: "€", label: "EUR" },
  FI: { code: "EUR", symbol: "€", label: "EUR" },
  GR: { code: "EUR", symbol: "€", label: "EUR" },
  CY: { code: "EUR", symbol: "€", label: "EUR" },
  MT: { code: "EUR", symbol: "€", label: "EUR" },
  SK: { code: "EUR", symbol: "€", label: "EUR" },
  SI: { code: "EUR", symbol: "€", label: "EUR" },
  EE: { code: "EUR", symbol: "€", label: "EUR" },
  LV: { code: "EUR", symbol: "€", label: "EUR" },
  LT: { code: "EUR", symbol: "€", label: "EUR" },
  LU: { code: "EUR", symbol: "€", label: "EUR" },
  HR: { code: "EUR", symbol: "€", label: "EUR" },
  CH: { code: "CHF", symbol: "CHF", label: "CHF" },
  SE: { code: "SEK", symbol: "kr", label: "SEK" },
  NO: { code: "NOK", symbol: "kr", label: "NOK" },
  DK: { code: "DKK", symbol: "kr", label: "DKK" },
  PL: { code: "PLN", symbol: "zł", label: "PLN" },
  CZ: { code: "CZK", symbol: "Kč", label: "CZK" },
  RO: { code: "RON", symbol: "lei", label: "RON" },
  HU: { code: "HUF", symbol: "Ft", label: "HUF" },
  BG: { code: "BGN", symbol: "лв", label: "BGN" },
  AE: { code: "AED", symbol: "د.إ", label: "AED" },
  SA: { code: "SAR", symbol: "﷼", label: "SAR" },
  AU: { code: "AUD", symbol: "A$", label: "AUD" },
  CA: { code: "CAD", symbol: "C$", label: "CAD" },
  NZ: { code: "NZD", symbol: "NZ$", label: "NZD" },
  IN: { code: "INR", symbol: "₹", label: "INR" },
  JP: { code: "JPY", symbol: "¥", label: "JPY" },
  KR: { code: "KRW", symbol: "₩", label: "KRW" },
  CN: { code: "CNY", symbol: "¥", label: "CNY" },
  BR: { code: "BRL", symbol: "R$", label: "BRL" },
  MX: { code: "MXN", symbol: "MX$", label: "MXN" },
  ZA: { code: "ZAR", symbol: "R", label: "ZAR" },
};

const FALLBACK: MarketCurrency = { code: "GBP", symbol: "£", label: "GBP" };

export function currencyForCountryCode(
  countryCode: string | null | undefined,
): MarketCurrency {
  const code = (countryCode || "").trim().toUpperCase();
  return COUNTRY_CURRENCY[code] ?? FALLBACK;
}

export function formatMoney(amount: number, currencyCode: string): string {
  const code = currencyCode.trim().toUpperCase();
  const locale = code === "TRY" ? "tr-TR" : code === "GBP" ? "en-GB" : "en";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

function isZeroPrice(price: string | number | null | undefined): boolean {
  if (price === null || price === undefined || price === "") return true;
  const n = typeof price === "number" ? price : Number.parseFloat(String(price));
  return !Number.isFinite(n) || n <= 0;
}

export function formatOfferPrice(opts: {
  price?: string | number | null;
  currency?: string | null;
  listingType?: string | null;
  countryCode?: string | null;
}): string {
  const type = (opts.listingType || "").toLowerCase();
  if (type === "free" || type === "give") return "Free";
  if (type === "exchange" || type === "swap") return "Swap";
  if (type === "need") return "I Need";
  if (type === "ownership" || type === "adoption") return "Adoption";
  if (isZeroPrice(opts.price)) return "Free";

  const code = (opts.currency || currencyForCountryCode(opts.countryCode).code).toUpperCase();
  const amount =
    typeof opts.price === "number" ? opts.price : Number.parseFloat(String(opts.price));
  return formatMoney(amount, code);
}
