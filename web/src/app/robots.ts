import type { MetadataRoute } from 'next'
import { getSiteUrl, getSiteUrlFromHeaders } from '@/lib/env'

// Dynamic route - her domain için farklı robots.txt
export const dynamic = 'force-dynamic';
 
export default async function robots(): Promise<MetadataRoute.Robots> {
  // Request'ten domain'i al - her domain için doğru robots.txt
  const siteUrl = await getSiteUrlFromHeaders();
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/account', '/messages', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

