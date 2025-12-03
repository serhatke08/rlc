'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Search,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUI } from "@/components/providers/ui-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const gradientButton =
  "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-lg shadow-[#9c6cfe]/30";

export function SiteHeader() {
  const { openMobileSidebar } = useUI();
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null = not logged in
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    // Kullanıcıyı kontrol et
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
      setLoading(false);
      
      if (user) {
        // Profil bilgilerini çek
        const { data } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    };
    
    checkUser();

    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", currentUser.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur-lg">
      {/* Desktop layout */}
      <div className="mx-auto hidden w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-3 text-sm font-semibold">
            {loading ? (
              <div className="h-10 w-20 animate-pulse rounded-2xl bg-zinc-200" />
            ) : user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-2 transition hover:border-emerald-200"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
                <span className="text-zinc-700">@{profile?.username || "Profile"}</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-2xl border border-zinc-200 px-4 py-2 text-zinc-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                Sign In
              </Link>
            )}
            <AddProductButton />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar />
          <div className="flex items-center gap-3">
            <Link
              href="/listings"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              Listings
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <button
          onClick={openMobileSidebar}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
        <div className="flex items-center gap-2">
          <AddProductButton compact />
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-zinc-200" />
          ) : user ? (
            <Link
              href="/account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-zinc-700" />
              )}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center rounded-2xl border border-zinc-200 px-3 text-xs font-semibold text-zinc-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/yenilogo.png"
        alt="ReloopCycle Logo"
        width={size === "lg" ? 180 : 140}
        height={size === "lg" ? 60 : 50}
        className="h-auto w-auto object-contain"
        priority
      />
    </Link>
  );
}

function SearchBar() {
  return (
    <div className="flex flex-1 items-center rounded-3xl border border-zinc-200 bg-white px-4 py-3 shadow-sm shadow-zinc-100">
      <Search className="h-5 w-5 text-zinc-400" />
      <input
        type="text"
        placeholder="Search products, categories or cities..."
        className="ml-3 flex-1 border-none bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
      />
    </div>
  );
}

function AddProductButton({ compact }: { compact?: boolean }) {
  return (
    <Link
      href="/create-listing"
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition hover:opacity-90",
        gradientButton,
        compact && "px-4 py-2 text-xs",
      )}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Product
    </Link>
  );
}

