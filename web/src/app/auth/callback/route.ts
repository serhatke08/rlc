import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getEnv, hasSupabaseCredentials } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/** OAuth ve e-posta doğrulama sonrası yönlendirme — sadece site içi path. */
function safeRelativePath(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "/account";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes(":")) {
    return "/account";
  }
  return trimmed;
}

/**
 * - Google (OAuth PKCE): `?code=...&next=/account`
 * - E-posta onayı (eski akış): `?token=...&type=signup`
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  if (!hasSupabaseCredentials()) {
    return NextResponse.redirect(new URL("/auth/login?error=config", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            //
          }
        },
      },
    },
  );

  const code = requestUrl.searchParams.get("code");
  const nextPath = safeRelativePath(requestUrl.searchParams.get("next"));

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }

    return NextResponse.redirect(new URL(nextPath, origin));
  }

  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");

  if (token && type === "signup") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }

    return NextResponse.redirect(new URL("/account", origin));
  }

  return NextResponse.redirect(
    new URL(`/auth/login?error=${encodeURIComponent("Invalid confirmation link")}`, origin),
  );
}
