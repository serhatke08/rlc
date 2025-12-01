import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase ortam değişkenleri tanımlanmadan istemci oluşturulamaz. .env.local dosyasını kontrol edin.");
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
  );
}

