import { headers } from "next/headers";

/**
 * Request header'larından domain'i alır
 * Server-side kullanım için
 */
export async function getCurrentDomain(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || headersList.get("x-forwarded-host");

    if (host) {
      const domain = host.replace(/^www\./, "");
      return domain;
    }
  } catch {
    // headers() sadece server component/route handler'da çalışır
  }

  return "reloopcycle.com";
}

function isUkHost(domain: string): boolean {
  return (
    domain === "reloopcycle.co.uk" ||
    domain.endsWith(".reloopcycle.co.uk") ||
    domain.includes("reloopcycle.co.uk")
  );
}

function isComHost(domain: string): boolean {
  return (
    domain === "reloopcycle.com" ||
    domain.endsWith(".reloopcycle.com") ||
    domain.includes("reloopcycle.com")
  );
}

export type DomainCountryCode = "GB" | "TR";

/**
 * Host → default market:
 * .co.uk → United Kingdom (GB)
 * .com → Turkey (TR)
 */
export async function getDomainCountryCode(): Promise<DomainCountryCode | null> {
  const domain = await getCurrentDomain();
  if (isUkHost(domain)) return "GB";
  if (isComHost(domain)) return "TR";
  return null;
}

/**
 * Anonymous listing filter: UK host → GB, .com → TR.
 */
export async function shouldFilterByDomain(): Promise<boolean> {
  return (await getDomainCountryCode()) !== null;
}

/**
 * Header / UI label for the host market.
 */
export async function getDomainCountryName(): Promise<string | null> {
  const code = await getDomainCountryCode();
  if (code === "GB") return "United Kingdom";
  if (code === "TR") return "Turkey";
  return null;
}

/** SEO city URLs: .co.uk → /uk/…, .com currently uses /us/… for US city pages. */
export type SeoCityMarket = "uk" | "us";

export async function getSeoCityMarketFromHost(): Promise<SeoCityMarket> {
  const domain = await getCurrentDomain();
  if (isUkHost(domain)) {
    return "uk";
  }
  return "us";
}
