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
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        // Even if there's an error, try to redirect
      }
      
      // Force hard redirect to ensure auth state is cleared
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect anyway
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
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

