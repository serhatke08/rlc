'use client';

import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Home,
  Info,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/components/providers/ui-provider";

const MAIN_LINKS = [
  { label: "Home", href: "/", icon: Home, bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: Heart,
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
  },
  { label: "My Account", href: "/account", icon: User, bgColor: "bg-purple-100", textColor: "text-purple-700" },
];

const BOTTOM_LINKS = [
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Phone },
];

export function SiteSidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse, mobileSidebarOpen, closeMobileSidebar } = useUI();

  return (
    <>
      <aside
        className={cn(
          "sticky top-[140px] hidden h-[calc(100vh-180px)] flex-col rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-sm shadow-zinc-100 backdrop-blur lg:flex",
          sidebarCollapsed ? "w-[88px]" : "w-72",
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebarCollapse}
          className="absolute -right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm lg:flex"
          aria-label="Collapse menu"
        >
          <ChevronLeft className={cn("h-4 w-4 transition", sidebarCollapsed && "rotate-180")} />
        </button>
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-0" onClick={closeMobileSidebar} />
          <aside className="relative h-full w-[85%] max-w-xs bg-white p-4">
            <SidebarContent collapsed={false} onNavigate={closeMobileSidebar} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="space-y-1">
        {MAIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-2xl px-3 py-3 text-sm font-semibold transition hover:opacity-80",
                collapsed && "justify-center px-0",
              )}
            >
              <span className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                item.bgColor || "bg-zinc-100",
                item.textColor || "text-zinc-700"
              )}>
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed && <span className={cn("ml-3", item.textColor || "text-zinc-600")}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>


      <div className="space-y-1">
        {BOTTOM_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-2xl px-3 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-5 w-5 text-zinc-400" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

