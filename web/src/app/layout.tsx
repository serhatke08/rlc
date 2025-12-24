import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { UIProvider } from "@/components/providers/ui-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/env";
import { getDomainIcon, getDomainFavicon, getHostnameFromSiteUrl } from "@/lib/domain-icons";

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

// Domain bazlı icon belirleme - Google için mutlak URL'ler gerekli
function getIconsForDomain() {
  try {
    const hostname = getHostnameFromSiteUrl(siteUrl);
    const iconPath = getDomainIcon(hostname);
    const faviconPath = getDomainFavicon(hostname);
    
    // Mutlak URL'ler oluştur (Google için gerekli)
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    
    return {
      icon: [
        { url: `${baseUrl}/favicon.ico`, sizes: "any" }, // Google için .ico dosyası (öncelikli)
        { url: `${baseUrl}${iconPath}`, sizes: "32x32", type: "image/png" },
        { url: `${baseUrl}${iconPath}`, sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: `${baseUrl}${iconPath}`, sizes: "180x180", type: "image/png" },
      ],
      shortcut: `${baseUrl}/favicon.ico`, // Google için .ico formatı
    };
  } catch {
    // Fallback - mutlak URL'ler
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    return {
      icon: [
        { url: `${baseUrl}/icon.png`, sizes: "32x32", type: "image/png" },
        { url: `${baseUrl}/icon.png`, sizes: "192x192", type: "image/png" },
        { url: `${baseUrl}/favicon.ico`, sizes: "any" },
      ],
      apple: [
        { url: `${baseUrl}/icon.png`, sizes: "180x180", type: "image/png" },
      ],
      shortcut: `${baseUrl}/favicon.ico`,
    };
  }
}

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
  icons: getIconsForDomain(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  // Domain bazlı favicon path'i ve mutlak URL'ler (Google için gerekli)
  const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  const hostname = getHostnameFromSiteUrl(siteUrl);
  const faviconPath = getDomainFavicon(hostname);
  const iconPath = getDomainIcon(hostname);

  return (
    <html lang="en">
      <head>
        {/* Favicon links for all domains - Google search results */}
        {/* Google'ın favicon'u görmesi için mutlak URL'ler ve .ico formatı gerekli */}
        <link rel="icon" type="image/x-icon" href={`${baseUrl}/favicon.ico`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${baseUrl}${iconPath}`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${baseUrl}${iconPath}`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${baseUrl}${iconPath}`} />
        <link rel="shortcut icon" type="image/x-icon" href={`${baseUrl}/favicon.ico`} />
        
        {/* Google AdSense Account Verification */}
        <meta name="google-adsense-account" content="ca-pub-6962376212093267" />
        
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
        {/* Google AdSense Code */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6962376212093267"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
