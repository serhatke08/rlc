import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv, hasSupabaseCredentials } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Session/cookie kullanmayan anonim Supabase istemcisi.
 * `unstable_cache` içinde kullanılmalıdır — `createSupabaseServerClient` burada
 * `cookies()` tetiklediği için Next.js ile uyumsuz ve hata üretebilir.
 * Sadece anon RLS ile okunabilen genel veriler için kullanın.
 */
export function createSupabasePublicReadClient() {
  if (!hasSupabaseCredentials()) {
    throw new Error("Supabase ortam değişkenleri tanımlı değil.");
  }

  return createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
