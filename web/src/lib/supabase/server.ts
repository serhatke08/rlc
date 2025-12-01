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

