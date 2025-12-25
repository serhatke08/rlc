'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Search,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUI } from "@/components/providers/ui-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { NotificationBell } from "@/components/notifications/notification-bell";

const gradientButton =
  "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-lg shadow-[#9c6cfe]/30";

export function SiteHeader() {
  const { openMobileSidebar } = useUI();
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null = not logged in
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();
    
    // Kullanıcıyı kontrol et - sadece getSession() kullan, getUser() deprecated ve bug yaratıyor
    const checkUser = async () => {
      try {
        // Sadece getSession() kullan - getUser() kaldırıldı
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        // Session hatası varsa veya session yoksa
        if (sessionError || !session) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // Session varsa user'ı direkt session'dan al
        const user = session.user;
        
        if (!user) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // User varsa set et
        setUser(user);
        setLoading(false);
        
        // Profil bilgilerini çek
        try {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", user.id)
            .single();
          
          if (!mounted) return;
          
          if (profileError) {
            console.error("Error loading profile:", profileError);
            setProfile(null);
          } else {
            setProfile(data);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          if (mounted) setProfile(null);
        }
      } catch (err) {
        console.error("Error in checkUser:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };
    
    checkUser();

    // Auth değişikliklerini dinle - login/logout için
    // TOKEN_REFRESHED kaldırıldı - Next.js App Router'da çift trigger yapıyor
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Sadece SIGNED_IN event'inde user'ı güncelle
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          
          // Profil bilgilerini çek
          try {
            const { data, error: profileError } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", session.user.id)
              .single();
            
            if (!mounted) return;
            
            if (!profileError && data) {
              setProfile(data);
            } else {
              setProfile(null);
            }
          } catch (err) {
            if (mounted) setProfile(null);
          }
        }
      }
      
      // SIGNED_OUT event'inde state'i temizle
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        alert('Error signing out. Please try again.');
        return;
      }
      
      setUser(null);
      setProfile(null);
      setDropdownOpen(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Error signing out. Please try again.');
    }
  };

  // Dropdown'u dışına tıklandığında kapat
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
              <>
                <NotificationBell />
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-2 transition hover:border-emerald-200"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username || "User"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-zinc-700">@{profile?.username || "Profile"}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-zinc-200 bg-white shadow-lg z-50">
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 first:rounded-t-2xl"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 last:rounded-b-2xl"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                <AddProductButton />
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-2xl border border-zinc-200 px-4 py-2 text-zinc-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar />
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
          {user && <NotificationBell />}
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-zinc-200" />
          ) : user ? (
            <div className="relative user-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-zinc-200 px-3"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || "User"}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-zinc-700" />
                )}
                {profile?.username && (
                  <span className="text-xs font-semibold text-zinc-700">@{profile.username}</span>
                )}
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-zinc-200 bg-white shadow-lg z-50">
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 first:rounded-t-2xl"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 last:rounded-b-2xl"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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

