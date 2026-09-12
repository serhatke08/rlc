import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { UIProvider } from "@/components/providers/ui-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/env";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { getDomainIcon, getDomainFavicon, getHostnameFromSiteUrl } from "@/lib/domain-icons";
import { AdSenseScript } from "@/components/ads/adsense-script";

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
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Give, swap, and reuse items locally. Reduce waste and build sustainable communities.",
  keywords: [
    "free stuff",
    "swap items online",
    "circular economy",
    "reuse platform",
    "zero waste",
    "second hand items",
    "ikel",
  ],
  openGraph: {
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description:
      "Give, swap, and reuse items locally. Connect with neighbors to reduce waste.",
    url: siteUrl,
    siteName: APP_NAME,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: "Give, swap, and reuse items locally.",
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
        <AdSenseScript />
        <UIProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </UIProvider>
      </body>
    </html>
  );
}
