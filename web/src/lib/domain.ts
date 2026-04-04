import { cookies, headers } from "next/headers";

/**
 * Request header'larından domain'i alır
 * Server-side kullanım için
 */
export async function getCurrentDomain(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || headersList.get("x-forwarded-host");
    
    if (host) {
      // www'yi kaldır
      const domain = host.replace(/^www\./, "");
      console.log("[getCurrentDomain] Detected domain from headers:", domain);
      return domain;
    }
  } catch (error) {
    // headers() sadece server component/route handler'da çalışır
    console.log("[getCurrentDomain] Error getting headers:", error);
  }
  
  // Fallback: Environment variable veya default
  console.log("[getCurrentDomain] Using fallback domain: reloopcycle.com");
  return "reloopcycle.com";
}

/**
 * Domain'e göre ülke filtreleme yapılıp yapılmayacağını belirler
 * reloopcycle.co.uk -> England'a özel (giriş yapmayan kullanıcılar için)
 * reloopcycle.com -> Cookie'e göre England (default) veya Worldwide
 *
 * Not: Şehir SEO URL'leri host ile ayrılır — .co.uk → /uk/…, .com → /us/… (getSeoCityMarketFromHost).
 */
export async function shouldFilterByDomain(): Promise<boolean> {
  const domain = await getCurrentDomain();

  // Cookie ile anons kullanıcılar için ülke modunu kontrol ederiz.
  // - reloopcycle.co.uk: her zaman İngiltere (England)
  // - reloopcycle.com: varsayılan İngiltere (England), butonla Worldwide <-> England togglable
  const cookieName = "reloopcycle_country_mode";
  type CountryMode = "england" | "worldwide";

  const getCookieMode = async (): Promise<CountryMode | null> => {
    const cookieStore = await cookies();
    const c = cookieStore.get(cookieName)?.value;
    if (c === "england" || c === "worldwide") return c;
    return null;
  };

  const isUkDomain = domain === "reloopcycle.co.uk" || domain.includes("reloopcycle.co.uk");
  if (isUkDomain) {
    console.log("[shouldFilterByDomain] Domain:", domain, "UK domain -> force England filter");
    return true;
  }

  const isComDomain = domain === "reloopcycle.com" || domain.includes("reloopcycle.com");
  if (!isComDomain) {
    console.log("[shouldFilterByDomain] Domain:", domain, "Unknown domain -> no domain filter");
    return false;
  }

  const mode = (await getCookieMode()) ?? "england"; // user request: com default England
  const shouldFilter = mode === "england";

  console.log("[shouldFilterByDomain] Domain:", domain, "Mode:", mode, "Should filter (England only):", shouldFilter);
  return shouldFilter;
}

/**
 * Domain'e göre gösterilecek ülke bilgisini döndürür
 * reloopcycle.co.uk -> "England"
 * reloopcycle.com -> Cookie'e göre "England" veya "Worldwide"
 */
export async function getDomainCountryName(): Promise<string | null> {
  const domain = await getCurrentDomain();

  const cookieName = "reloopcycle_country_mode";
  type CountryMode = "england" | "worldwide";

  const getCookieMode = async (): Promise<CountryMode | null> => {
    const cookieStore = await cookies();
    const c = cookieStore.get(cookieName)?.value;
    if (c === "england" || c === "worldwide") return c;
    return null;
  };

  const isUkDomain = domain === "reloopcycle.co.uk" || domain.includes("reloopcycle.co.uk");
  if (isUkDomain) return "England";

  const isComDomain = domain === "reloopcycle.com" || domain.includes("reloopcycle.com");
  if (!isComDomain) return null;

  const mode = (await getCookieMode()) ?? "england";
  return mode === "england" ? "England" : "Worldwide";
}

/** SEO city URLs: .co.uk → UK paths, .com → US paths; other hosts default to US. */
export type SeoCityMarket = "uk" | "us";

export async function getSeoCityMarketFromHost(): Promise<SeoCityMarket> {
  const domain = await getCurrentDomain();
  const isUkDomain =
    domain === "reloopcycle.co.uk" ||
    domain.endsWith(".reloopcycle.co.uk") ||
    domain.includes("reloopcycle.co.uk");
  if (isUkDomain) {
    return "uk";
  }
  const isComDomain =
    domain === "reloopcycle.com" ||
    domain.endsWith(".reloopcycle.com") ||
    domain.includes("reloopcycle.com");
  if (isComDomain) {
    return "us";
  }
  return "us";
}
