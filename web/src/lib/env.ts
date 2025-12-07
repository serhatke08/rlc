type EnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY" | "NEXT_PUBLIC_SITE_URL";

const cache = new Map<EnvKey, string>();

export function getEnv(key: EnvKey, options?: { optional?: boolean }) {
  if (cache.has(key)) {
    return cache.get(key) as string;
  }

  const value = process.env[key];
  if (!value && !options?.optional) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Populate it in .env.local (see .env.example).`,
    );
  }

  const normalized = value ?? "";
  cache.set(key, normalized);
  return normalized;
}

export function hasSupabaseCredentials() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0) > 0 &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0) > 0,
  );
}

/**
 * Request header'larından domain'i al (server-side)
 * Bu fonksiyon sitemap ve robots.txt gibi route handler'larda kullanılır
 * Next.js 15'te headers() async olmalı
 */
export async function getSiteUrlFromHeaders(): Promise<string> {
  try {
    // Next.js 15'te headers() async
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host');
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    
    if (host) {
      // www'yi kaldır (isteğe bağlı)
      const cleanHost = host.replace(/^www\./, '');
      return `${protocol}://${cleanHost}`;
    }
  } catch (error) {
    // headers() sadece server component/route handler'da çalışır
    // Bu normal, fallback kullanılacak
  }
  
  // Fallback: Environment variable veya default
  return getSiteUrl();
}

/**
 * Vercel'de otomatik olarak sağlanan URL'i veya custom domain'i döndürür
 * Production'da mutlaka reloopcycle.co.uk kullanılır, preview'da VERCEL_URL kullanılabilir
 */
export function getSiteUrl(): string {
  // Production'da Vercel'in otomatik algıladığı domain'i kullan
  // Veya environment variable'dan al
  const isProduction = process.env.VERCEL_ENV === 'production' || 
                       (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL);
  
  // Önce custom domain environment variable'ını kontrol et
  const customDomain = process.env.NEXT_PUBLIC_SITE_URL;
  if (customDomain) {
    return customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
  }

  // Production'da Vercel'in otomatik algıladığı domain'i kullan
  // Bu sayede reloopcycle.co.uk, reloopcycle.com, reloopcycle.net, reloopcycle.org
  // hepsi kendi domain'lerini kullanır
  if (isProduction) {
    // Vercel otomatik olarak doğru domain'i sağlar
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && !vercelUrl.includes('vercel.app')) {
      // Custom domain kullanılıyor
      return `https://${vercelUrl}`;
    }
    // Fallback: Ana domain
    return 'https://reloopcycle.co.uk';
  }

  // Preview deployment'larda Vercel URL'i kullan
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Development için fallback
  return 'http://localhost:3000';
}

