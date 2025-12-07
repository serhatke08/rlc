'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Heart, Home, PlusCircle, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
  requiresAuth?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Add", href: "/create-listing", icon: PlusCircle, highlight: true, requiresAuth: true },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Profile", href: "/account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Filter items based on auth requirement
  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.requiresAuth && !user) {
      return false;
    }
    return true;
  });
  
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-2 shadow-2xl shadow-black/10 backdrop-blur lg:hidden">
      <ul className="flex items-center justify-between">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          if (item.highlight) {
            return (
              <li key={item.label} className="-mt-6">
                <Link
                  href={item.href}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-2xl shadow-[#9c6cfe]/40 transition hover:scale-105"
                >
                  <Icon className="h-7 w-7" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${
                  isActive 
                    ? "text-zinc-900" 
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

