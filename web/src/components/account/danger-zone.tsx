"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AccountDangerZone() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      // Call server-side logout API to clear server cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error("Server logout failed:", e);
    }
    
    // Also try client-side logout
    const supabase = createSupabaseBrowserClient();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      try {
        await supabase.auth.signOut();
      } catch (e2) {
        console.error("Client signOut failed:", e2);
      }
    }
    
    // Clear all client-side storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Clear individual keys
        [...Object.keys(localStorage), ...Object.keys(sessionStorage)].forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (e) {}
        });
      }
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.split("=")[0].trim();
        if (cookieName) {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${window.location.hostname};`;
        }
      });
    }
    
    // Wait a bit longer
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force hard redirect
    window.location.href = "/auth/login";
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account and all your listings? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    setLoading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("delete_user_account");
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/auth/register");
  };

  return (
    <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-600">Account Actions</h2>
      <p className="text-sm text-rose-400">You can sign out or completely delete your account.</p>

      {message ? <p className="mt-4 text-sm text-rose-500">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-70"
        >
          Sign Out
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-70"
        >
          Delete Account
        </button>
      </div>
    </section>
  );
}

