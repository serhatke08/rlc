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
      return host.replace(/^www\./, "");
    }
  } catch (error) {
    // headers() sadece server component/route handler'da çalışır
  }
  
  // Fallback: Environment variable veya default
  return "reloopcycle.com";
}

/**
 * Domain'e göre ülke filtreleme yapılıp yapılmayacağını belirler
 * reloopcycle.co.uk -> England'a özel (giriş yapmayan kullanıcılar için)
 * reloopcycle.com -> Tüm dünya
 */
export async function shouldFilterByDomain(): Promise<boolean> {
  const domain = await getCurrentDomain();
  return domain === "reloopcycle.co.uk";
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
