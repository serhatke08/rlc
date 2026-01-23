import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getEnv, hasSupabaseCredentials } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials()) {
    throw new Error("Supabase ortam değişkenleri tanımlı değil.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component'ta set çağrısı ignore edilir
          }
        },
      },
    },
  );
}

/**
 * Güvenli şekilde kullanıcı bilgisini alır
 * Önce getSession() ile kontrol eder, refresh token hatasından kaçınır
 */
export async function getServerUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Önce session kontrolü yap - refresh token gerektirmez
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Session yoksa veya hata varsa direkt null döndür
    if (sessionError || !session || !session.user) {
      return null;
    }
    
    // Session geçerliyse, user'ı session'dan al (getUser() çağırmaya gerek yok)
    return session.user;
  } catch (error: any) {
    // Herhangi bir hata durumunda sessizce null döndür
    // Refresh token, network veya diğer hataları ignore et
    return null;
  }
}

