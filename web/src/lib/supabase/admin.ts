import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * RLS bypass — sadece sunucuda, sadece güvenilir işlemler (ör. seo_path backfill).
 * Vercel / .env.local: SUPABASE_SERVICE_ROLE_KEY
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    return null;
  }
  return createClient<Database>(getEnv("NEXT_PUBLIC_SUPABASE_URL"), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
