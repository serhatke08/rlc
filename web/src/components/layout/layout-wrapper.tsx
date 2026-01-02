'use client';

import { usePathname } from "next/navigation";
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
  
  if (isChatPage) {
    return <>{children}</>;
  }

  if (isMessagesPage) {
    return (
      <div className="relative h-screen overflow-hidden bg-white">
        <SiteHeader />
        <div className="mx-auto flex h-[calc(100vh-140px)] w-full max-w-[1600px] gap-6 px-4 pt-1 lg:px-8">
          <SiteSidebar />
          <main className="flex-1 min-w-0 overflow-hidden rounded-[32px] bg-white px-2 py-2 shadow-sm shadow-zinc-100 lg:px-4 lg:py-4">
            {children}
          </main>
        </div>
        {/* Footer yok */}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-24 pt-1 lg:px-8">
        <SiteSidebar />
        <main className="flex-1 min-w-0 rounded-[32px] bg-white px-4 py-6 shadow-sm shadow-zinc-100">
          {children}
        </main>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

