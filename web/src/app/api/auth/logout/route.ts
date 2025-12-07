import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function POST() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
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
            // Ignore errors in server components
          }
        },
      },
    }
  );

  // Sign out - global scope tüm cihazlarda logout yapar
  await supabase.auth.signOut({ scope: 'global' });

  // Clear all auth-related cookies
  // Next.js 14+ için cookie silme: delete() yerine set with maxAge: 0 kullan
  const allCookies = cookieStore.getAll();
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
      cookieStore.set(cookie.name, "", {
        maxAge: 0,
        path: "/",
      });
    }
  });

  return NextResponse.json({ success: true });
}

