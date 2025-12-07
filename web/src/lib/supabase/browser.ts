import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";

// Singleton pattern - tek bir client instance kullan
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  // Eğer client zaten varsa, aynı instance'ı döndür
  if (typeof window !== 'undefined' && supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase ortam değişkenleri tanımlanmadan istemci oluşturulamaz. .env.local dosyasını kontrol edin.");
  }

  // SSR ile uyumlu createBrowserClient kullan
  // Cookie handling otomatik yapılır
  supabaseClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  return supabaseClient;
}

