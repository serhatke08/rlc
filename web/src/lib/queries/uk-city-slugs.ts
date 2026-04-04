import { unstable_cache } from "next/cache";

import { createSupabasePublicReadClient } from "@/lib/supabase/public-read";
import type { City } from "@/lib/types/location";
import { isValidCitySlugFormat, slugifyCityPathSegment } from "@/lib/slug";

type CityRow = {
  city_id: string;
  city_name: string;
  region_id: string;
  country_id: string;
  is_major: boolean | null;
};

async function fetchUnitedKingdomCountryIds(): Promise<string[]> {
  const supabase = createSupabasePublicReadClient();
  const { data, error } = await supabase
    .from("countries")
    .select("id")
    .in("code", ["GB", "SCT", "WLS", "NIR", "ENG"]);

  if (error || !data?.length) {
    console.error("[uk-city-slugs] Failed to resolve UK country ids:", error);
    return [];
  }

  const rows = data as { id: string }[];
  return [...new Set(rows.map((r) => r.id))];
}

async function loadUkCitySlugIndex(): Promise<Map<string, City[]>> {
  const countryIds = await fetchUnitedKingdomCountryIds();
  if (countryIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabasePublicReadClient();
  const { data, error } = await supabase
    .from("cities_full_info")
    .select("city_id, city_name, region_id, country_id, is_major")
    .in("country_id", countryIds);

  if (error) {
    console.error("[uk-city-slugs] cities_full_info query failed:", error);
    return new Map();
  }

  const bySlug = new Map<string, City[]>();
  const rows = (data || []) as CityRow[];
  const isMajorByCityId = new Map<string, boolean>();
  for (const row of rows) {
    isMajorByCityId.set(row.city_id, !!row.is_major);
  }

  for (const row of rows) {
    const slug = slugifyCityPathSegment(row.city_name);
    if (!slug) continue;

    const city: City = {
      id: row.city_id,
      name: row.city_name,
      region_id: row.region_id,
      country_id: row.country_id,
    };

    const list = bySlug.get(slug) ?? [];
    list.push(city);
    bySlug.set(slug, list);
  }

  for (const [slug, list] of bySlug) {
    list.sort((a, b) => {
      const am = isMajorByCityId.get(a.id) ? 1 : 0;
      const bm = isMajorByCityId.get(b.id) ? 1 : 0;
      if (bm !== am) return bm - am;
      return a.name.localeCompare(b.name, "en-GB");
    });
    bySlug.set(slug, list);
  }

  return bySlug;
}

const getCachedUkCitySlugIndex = unstable_cache(loadUkCitySlugIndex, ["uk-city-slug-index-v4-public-read-client"], {
  revalidate: 3600,
});

export async function getUkCityBySlug(slug: string): Promise<City | null> {
  const normalized = slug.toLowerCase().trim();
  if (!isValidCitySlugFormat(normalized)) {
    return null;
  }

  const index = await getCachedUkCitySlugIndex();
  const list = index.get(normalized);
  if (!list?.length) {
    return null;
  }

  return list[0] ?? null;
}

/** Distinct path segments for sitemap (one URL per slug; ties use primary city). */
export async function listUkCityPathSegmentsForSitemap(): Promise<string[]> {
  const index = await getCachedUkCitySlugIndex();
  return [...index.keys()].sort((a, b) => a.localeCompare(b, "en-GB"));
}
