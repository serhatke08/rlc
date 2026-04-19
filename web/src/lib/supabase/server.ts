import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getEnv, hasSupabaseCredentials } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/** Bozuk refresh / JWT — çerezleri temizle (bir sonraki istek temiz). */
export function shouldClearStaleAuthCookies(err: { message?: string } | null | undefined): boolean {
  const msg = (err?.message ?? "").toLowerCase();
  return msg.includes("refresh token") || msg.includes("invalid jwt");
}

/** Beklenen anon / eksik oturum — loglama. */
export function isExpectedAuthSessionNoise(
  err: { message?: string; name?: string; status?: number } | null | undefined,
): boolean {
  if (!err) return false;
  if (err.name === "AuthSessionMissingError" || err.status === 400) return true;
  return shouldClearStaleAuthCookies(err);
}

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

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (shouldClearStaleAuthCookies(sessionError)) {
        await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      } else if (!isExpectedAuthSessionNoise(sessionError)) {
        console.error("[getServerUser] getSession error:", sessionError.message);
      }
      return null;
    }

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

