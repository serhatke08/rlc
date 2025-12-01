import type { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mission`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/free-stuff-near-me`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/give-away-items-uk`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/swap-items-online`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reuse-items-platform`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/zero-waste-community-uk`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Dynamic listing pages
  const supabase = await createSupabaseServerClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('id, slug, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1000)

  const listingsData = (listings || []) as any[];
  const listingPages: MetadataRoute.Sitemap = listingsData.map((listing: any) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: new Date(listing.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...listingPages]
}

