'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Heart,
  Home,
  Info,
  MessageSquare,
  Phone,
  User,
  Tag,
  Settings,
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
  { label: "Price", href: "/subscription", icon: Tag },
  { label: "About", href: "/about", icon: Info },
];

const CONTACT_LINK = { label: "Contact", href: "/contact", icon: Phone };

const APP_STORE_URL =
  "https://apps.apple.com/tr/app/reloop-cycle-reuse-items/id6755662726?l=tr";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.reloopcycle.app&pcampaignid=web_share";

function AppleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
    </svg>
  );
}

function AndroidMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0008.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.5758 12 7.5758s-3.609.6681-4.9473 1.6917L4.7949 5.264a.416.416 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.76h24c-.3438-4.1011-2.6894-7.5733-6.1195-9.4386"
      />
    </svg>
  );
}

export function SiteSidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse, mobileSidebarOpen, closeMobileSidebar } = useUI();

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col rounded-none border-r border-zinc-200 bg-white/80 p-4 shadow-sm shadow-zinc-100 backdrop-blur lg:flex lg:rounded-r-3xl",
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
  const [showSettingsNotice, setShowSettingsNotice] = useState(false);
  const noticeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showSettingsNotice) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!noticeRef.current) return;

      if (!noticeRef.current.contains(target)) {
        setShowSettingsNotice(false);
      }
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [showSettingsNotice]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <nav className="pt-2 shrink-0 space-y-1">
        {MAIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-lg px-3 py-3 text-sm font-semibold transition hover:opacity-80",
                item.bgColor || "bg-zinc-100",
                item.textColor || "text-zinc-700",
                collapsed && "justify-center px-0",
              )}
            >
              <span className={cn(
                "relative inline-flex h-5 w-5 items-center justify-center",
                item.textColor || "text-zinc-700"
              )}>
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed && <span className={cn("ml-3", item.textColor || "text-zinc-600")}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-2 shrink-0">
        <button
          type="button"
          onClick={() => setShowSettingsNotice(true)}
          className={cn(
            "group flex w-full items-center rounded-lg px-3 py-3 text-sm font-semibold transition hover:opacity-80 bg-emerald-100 text-emerald-700",
            collapsed && "justify-center px-0",
          )}
          aria-label="Settings"
        >
          <span
            className={cn(
              "relative inline-flex h-5 w-5 items-center justify-center",
              "text-emerald-700",
            )}
          >
            <Settings className="h-5 w-5" />
          </span>
          {!collapsed && <span className="ml-3">Settings</span>}
        </button>

        {showSettingsNotice && (
          <div
            ref={noticeRef}
            className={cn(
              "absolute left-0 top-full z-50 mt-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm",
              collapsed ? "w-[13rem]" : "w-full",
            )}
            role="dialog"
            aria-label="Settings information"
          >
            <p className="text-sm font-semibold text-zinc-900">
              Settings are only available in the mobile app.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Download the app to change your settings.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                aria-label="Download on the App Store"
                className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-2"
              >
                <AppleMark className="h-5 w-5 text-zinc-900" />
                <span className="text-[10px] font-semibold text-zinc-600">iOS</span>
              </a>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                aria-label="Get it on Google Play"
                className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-2"
              >
                <AndroidMark className="h-5 w-5 text-emerald-600" />
                <span className="text-[10px] font-semibold text-zinc-600">
                  Android
                </span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsNotice(false)}
              className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Got it
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 space-y-1">
        <div
          className={cn(
            "border-t border-zinc-200 pt-2",
            collapsed && "flex flex-col items-center gap-1",
          )}
        >
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100",
              collapsed && "justify-center px-0 py-2",
            )}
            aria-label="Download on the App Store"
          >
            <span
              className={cn(
                "sidebar-store-icon flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/70",
                collapsed ? "m-0" : "",
              )}
            >
              <span className="sidebar-store-icon-shine" aria-hidden />
              <AppleMark className="h-5 w-5 shrink-0 text-zinc-800" />
            </span>
            {!collapsed && <span className="ml-3">App Store</span>}
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100",
              collapsed && "justify-center px-0 py-2",
            )}
            aria-label="Get it on Google Play"
          >
            <span
              className={cn(
                "sidebar-store-icon flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/70",
                collapsed ? "m-0" : "",
              )}
            >
              <span className="sidebar-store-icon-shine" aria-hidden />
              <AndroidMark className="h-5 w-5 shrink-0 text-emerald-600" />
            </span>
            {!collapsed && <span className="ml-3">Google Play</span>}
          </a>
        </div>

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

        <Link
          href={CONTACT_LINK.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center rounded-2xl px-3 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100",
            collapsed && "justify-center px-0",
          )}
          aria-label="Contact"
        >
          <CONTACT_LINK.icon className="h-5 w-5 text-zinc-400" />
          {!collapsed && <span className="ml-3">{CONTACT_LINK.label}</span>}
        </Link>
      </div>
    </div>
  );
}

