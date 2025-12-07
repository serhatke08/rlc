import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { UIProvider } from "@/components/providers/ui-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ReloopCycle | Give, Swap, Reuse - UK Circular Economy Marketplace",
    template: "%s | ReloopCycle",
  },
  description:
    "UK's leading circular economy marketplace. Give, swap, and reuse items locally. Reduce waste and build sustainable communities.",
  keywords: [
    "free stuff UK",
    "swap items online",
    "circular economy",
    "reuse platform",
    "zero waste",
    "UK marketplace",
    "second hand items",
  ],
  openGraph: {
    title: "ReloopCycle | Give, Swap, Reuse",
    description:
      "UK's leading circular economy marketplace. Connect with neighbors to give, swap, and reuse items locally.",
    url: siteUrl,
    siteName: "ReloopCycle",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReloopCycle | Give, Swap, Reuse",
    description: "UK's circular economy marketplace powered by Next.js and Supabase.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UIProvider>
          <div className="relative min-h-screen bg-white">
            <SiteHeader />
            <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 pb-24 pt-1 lg:px-6">
              <SiteSidebar />
              <main className="flex-1 min-w-0 rounded-[32px] bg-white px-4 py-6 shadow-sm shadow-zinc-100">
                {children}
              </main>
            </div>
            <SiteFooter />
            <MobileBottomNav />
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
