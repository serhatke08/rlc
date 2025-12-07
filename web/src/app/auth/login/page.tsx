"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect") || "/account";

  // Eğer kullanıcı zaten giriş yapmışsa account sayfasına yönlendir
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      // Timeout ekle - 2 saniye sonra kontrolü bitir
      const timeoutId = setTimeout(() => {
        if (mounted) {
          setCheckingAuth(false);
        }
      }, 2000);
      
      try {
        const supabase = createSupabaseBrowserClient();
        
        // Hızlı session kontrolü - getUser() yerine getSession() kullan
        const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        
        clearTimeout(timeoutId);
        
        if (mounted) {
          if (session?.user) {
            // If user is already logged in, redirect to the intended page or account
            const redirect = searchParams.get("redirect");
            window.location.href = redirect || "/account";
          } else {
            setCheckingAuth(false);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      
      if (data?.user) {
        // Başarılı login - redirect URL'e yönlendir veya account sayfasına
        window.location.assign(redirectUrl);
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
          <h1 className="text-2xl font-semibold text-zinc-900">Checking authentication...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in to your account</h1>
        <p className="text-sm text-zinc-500">Continue to the free sharing community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Şifre
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-sm text-zinc-500">
        <Link href="/auth/forgot-password" className="text-emerald-700 hover:text-emerald-500">
          Forgot your password?
        </Link>
        <p>
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-emerald-700 hover:text-emerald-500">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

