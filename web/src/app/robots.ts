import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/env'
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
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

