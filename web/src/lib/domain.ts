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
 * reloopcycle.com -> Tüm dünya
 */
export async function shouldFilterByDomain(): Promise<boolean> {
  const domain = await getCurrentDomain();
  const shouldFilter = domain === "reloopcycle.co.uk" || domain.includes("reloopcycle.co.uk");
  console.log("[shouldFilterByDomain] Domain:", domain, "Should filter:", shouldFilter);
  return shouldFilter;
}

/**
 * Domain'e göre gösterilecek ülke bilgisini döndürür
 * reloopcycle.co.uk -> "England"
 * reloopcycle.com -> null (tüm dünya)
 */
export async function getDomainCountryName(): Promise<string | null> {
  const domain = await getCurrentDomain();
  if (domain === "reloopcycle.co.uk") {
    return "England";
  }
  return null;
}
