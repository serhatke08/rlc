'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Plus,
  Search,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUI } from "@/components/providers/ui-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { NotificationBell } from "@/components/notifications/notification-bell";

const gradientButton =
  "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-lg shadow-[#9c6cfe]/30";

export function SiteHeader() {
  const { openMobileSidebar } = useUI();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null = not logged in
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Mesajlar sayfasında search bar gösterme
  const isMessagesPage = pathname === '/messages' || pathname?.startsWith('/messages/');

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
          setProfileLoading(false);
          return;
        }
        
        // Session varsa user'ı direkt session'dan al
        const user = session.user;
        
        if (!user) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setProfileLoading(false);
          return;
        }
        
        // User varsa set et
        setUser(user);
        setLoading(false);
        
        // Profil bilgilerini çek
        setProfileLoading(true);
        const fetchProfile = async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (!mounted) return;
            
            if (profileError) {
              console.error("[SiteHeader] Profile error:", profileError);
              setProfile(null);
            } else {
              setProfile(profile);
            }
          } catch (err) {
            console.error("[SiteHeader] Profile fetch error:", err);
            if (mounted) setProfile(null);
          } finally {
            if (mounted) setProfileLoading(false);
          }
        };
        
        fetchProfile();
      } catch (err) {
        console.error("Error in checkUser:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };
    
    checkUser();

    // Auth değişikliklerini dinle - login/logout için
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("[SiteHeader] Auth state change:", event, session?.user?.id);
      
      // SIGNED_IN ve TOKEN_REFRESHED event'lerinde user'ı güncelle
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log("[SiteHeader] Auth change - user signed in:", session.user.id);
          setUser(session.user);
          setLoading(false);
          
          // Profil bilgilerini çek
          setProfileLoading(true);
          const fetchProfile = async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
              
              if (!mounted) return;
              
              if (profileError) {
                console.error("[SiteHeader] Profile error:", profileError);
                setProfile(null);
              } else {
                setProfile(profile);
              }
            } catch (err) {
              console.error("[SiteHeader] Profile fetch error:", err);
              if (mounted) setProfile(null);
            } finally {
              if (mounted) setProfileLoading(false);
            }
          };
          
          fetchProfile();
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
      
      // SIGNED_OUT event'inde state'i temizle
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setProfileLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);



  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur-lg">
      {/* Desktop layout */}
      <div className="mx-auto hidden w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex">
        <div className="relative flex items-center justify-center">
          <Logo size="lg" />
          <div className="absolute right-0 flex items-center gap-3 text-sm font-semibold">
            {loading ? (
              <div className="h-10 w-20 animate-pulse rounded-2xl bg-zinc-200" />
            ) : user ? (
              <>
                <NotificationBell />
                <ProfileIndicator profile={profile} />
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
        {!isMessagesPage && (
          <div className="flex items-center gap-4">
            <SearchBar />
          </div>
        )}
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
        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-zinc-200" />
          ) : user ? (
            <ProfileIndicator profile={profile} compact />
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

function ProfileIndicator({ profile, compact }: { profile: any; compact?: boolean }) {
  if (!profile) {
    return (
      <Link
        href="/account"
        className={cn(
          "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-zinc-700 transition hover:border-emerald-200 hover:bg-zinc-50",
          compact && "px-2 py-1.5",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <User className={cn("text-white", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>
        {!compact && (
          <span className="text-sm font-medium text-zinc-700">User</span>
        )}
      </Link>
    );
  }

  const displayName = profile.display_name || profile.username || "User";
  const avatarUrl = profile.avatar_url;

  return (
    <Link
      href="/account"
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-zinc-700 transition hover:border-emerald-200 hover:bg-zinc-50",
        compact && "px-2 py-1.5",
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className={cn(
            "rounded-full object-cover",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <User className={cn("text-white", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>
      )}
      {!compact && (
        <span className="text-sm font-medium text-zinc-700">{displayName}</span>
      )}
    </Link>
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

