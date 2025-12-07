"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Sadece server-side logout API çağrısı yap
      // Client-side signOut çağrılmıyor - çift logout çakışmasını önlemek için
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Redirect - window.location.assign Next.js App Router için daha güvenilir
      window.location.assign("/auth/login");
    } catch (err) {
      console.error('Logout error:', err);
      // Hata olsa bile redirect et
      window.location.assign("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-70 disabled:cursor-not-allowed"
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}

