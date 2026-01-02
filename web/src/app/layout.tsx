import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { UIProvider } from "@/components/providers/ui-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
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

// Domain-based icon determination
// Relative paths are automatically converted to absolute URLs thanks to metadataBase
function getIconsForDomain() {
  try {
    const hostname = getHostnameFromSiteUrl(siteUrl);
    const iconPath = getDomainIcon(hostname);
    const faviconPath = getDomainFavicon(hostname);
    
    return {
      icon: [
        { url: faviconPath, sizes: "any" }, // .ico file for Google (priority)
        { url: iconPath, sizes: "any" }, // Main icon
        { url: '/icon-32x32.png', sizes: "32x32", type: "image/png" },
        { url: '/icon-192x192.png', sizes: "192x192", type: "image/png" },
        { url: '/icon-512x512.png', sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: iconPath, sizes: "180x180", type: "image/png" },
        { url: '/icon-192x192.png', sizes: "180x180", type: "image/png" },
      ],
      shortcut: faviconPath, // .ico format for Google
    };
  } catch {
    // Fallback
    return {
      icon: [
        { url: '/favicon.ico', sizes: "any" },
        { url: '/icon.png', sizes: "any" },
        { url: '/icon-32x32.png', sizes: "32x32", type: "image/png" },
        { url: '/icon-192x192.png', sizes: "192x192", type: "image/png" },
        { url: '/icon-512x512.png', sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: '/icon.png', sizes: "180x180", type: "image/png" },
        { url: '/icon-192x192.png', sizes: "180x180", type: "image/png" },
      ],
      shortcut: '/favicon.ico',
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

  return (
    <html lang="en">
      <head>
        {/* Google AdSense Account Verification */}
        <meta name="google-adsense-account" content="ca-pub-6962376212093267" />
        
        {/* Favicon - metadata'da tanımlı, burada ekstra link gerekmez */}
        {/* Absolute URLs for Google are already defined in metadata */}
        
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
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
