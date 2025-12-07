import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";

// Singleton pattern - tek bir client instance kullan
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;
let authErrorHandlerSetup = false;

// Geçersiz token hatalarını yakala ve temizle
function setupAuthErrorHandler(client: ReturnType<typeof createBrowserClient<Database>>) {
  if (typeof window === 'undefined' || authErrorHandlerSetup) return;
  
  authErrorHandlerSetup = true;
  
  // Auth state değişikliklerini dinle
  client.auth.onAuthStateChange((event, session) => {
    // Session yoksa ve SIGNED_OUT event'i değilse, hata olabilir
    if (event === 'TOKEN_REFRESHED' && !session) {
      // Token refresh başarısız oldu, session'ı temizle
      console.warn('Token refresh failed, clearing session');
      client.auth.signOut({ scope: 'local' }).catch(() => {
        // Ignore signOut errors
      });
    }
  });
}

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

  // Auth error handler'ı kur
  setupAuthErrorHandler(supabaseClient);

  return supabaseClient;
}

