'use client';

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Chat sayfasında header/footer/sidebar gösterme
  const isChatPage = pathname?.startsWith('/messages/') && pathname !== '/messages';
  
  // Mesajlar sayfasında footer gösterme (ama header/sidebar var)
  const isMessagesPage = pathname === '/messages';

  // Subscription sayfasında pricing/credit kartları footer'da da görünüyor.
  // İstendiği gibi subscription içeriğini temiz tutmak için footer'ı gizliyoruz.
  const isSubscriptionPage = pathname === '/subscription';
  
  if (isChatPage) {
    return <>{children}</>;
  }

  if (isMessagesPage) {
    return (
      <div className="relative flex h-screen flex-col overflow-hidden bg-white lg:flex-row lg:items-stretch">
        <SiteSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 px-4 pt-1 lg:px-8">
            <main className="min-h-0 w-full min-w-0 overflow-hidden rounded-[32px] bg-white px-2 py-2 shadow-sm shadow-zinc-100 lg:px-4 lg:py-4">
              {children}
            </main>
          </div>
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  const isHome = pathname === "/";

  return (
    <div className="relative flex min-h-screen flex-col bg-white lg:flex-row lg:items-stretch">
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader />
        <div
          className={cn(
            "mx-auto w-full max-w-[1600px] flex-1 px-4 pb-24 lg:px-8",
            isHome ? "pt-2" : "pt-1",
          )}
        >
          <main
            className={cn(
              "min-w-0 rounded-[32px] bg-white px-4 shadow-sm shadow-zinc-100",
              isHome ? "pb-6 pt-1.5" : "py-6",
            )}
          >
            {children}
          </main>
        </div>
        {!isSubscriptionPage && <SiteFooter />}
        <MobileBottomNav />
      </div>
    </div>
  );
}

