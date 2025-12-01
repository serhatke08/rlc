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
 * Vercel'de otomatik olarak sağlanan URL'i veya custom domain'i döndürür
 * Production'da NEXT_PUBLIC_SITE_URL kullanılmalı, yoksa VERCEL_URL kullanılır
 */
export function getSiteUrl(): string {
  // Önce custom domain'i kontrol et
  const customDomain = process.env.NEXT_PUBLIC_SITE_URL;
  if (customDomain) {
    return customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
  }

  // Vercel'de otomatik sağlanan URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Development için fallback
  return process.env.NODE_ENV === 'production' 
    ? 'https://reloopcycle.com' 
    : 'http://localhost:3000';
}

