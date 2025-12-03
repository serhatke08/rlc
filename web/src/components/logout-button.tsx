"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
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

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <LogOut className="h-4 w-4" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}

