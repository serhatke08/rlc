import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { City } from "@/lib/types/location";
import { isValidCitySlugFormat, slugifyCityPathSegment } from "@/lib/slug";

type CityRow = {
  city_id: string;
  city_name: string;
  region_id: string;
  country_id: string;
  is_major: boolean | null;
};

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function fetchUnitedStatesCountryIds(supabase: SupabaseServer): Promise<string[]> {
  const { data, error } = await supabase.from("countries").select("id").in("code", ["US", "USA"]);

  if (error || !data?.length) {
    console.error("[us-city-slugs] Failed to resolve US country ids:", error);
    return [];
  }

  const rows = data as { id: string }[];
  return [...new Set(rows.map((r) => r.id))];
}

async function loadUsCitySlugIndex(): Promise<Map<string, City[]>> {
  const supabase = await createSupabaseServerClient();
  const countryIds = await fetchUnitedStatesCountryIds(supabase);
  if (countryIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("cities_full_info")
    .select("city_id, city_name, region_id, country_id, is_major")
    .in("country_id", countryIds);

  if (error) {
    console.error("[us-city-slugs] cities_full_info query failed:", error);
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
      return a.name.localeCompare(b.name, "en-US");
    });
    bySlug.set(slug, list);
  }

  return bySlug;
}

const getUsCitySlugIndexCached = cache(async (): Promise<Map<string, City[]>> => {
  try {
    return await loadUsCitySlugIndex();
  } catch (err) {
    console.error("[us-city-slugs] loadUsCitySlugIndex failed:", err);
    return new Map();
  }
});

export async function getUsCityBySlug(slug: string): Promise<City | null> {
  const normalized = slug.toLowerCase().trim();
  if (!isValidCitySlugFormat(normalized)) {
    return null;
  }

  let index: Map<string, City[]>;
  try {
    index = await getUsCitySlugIndexCached();
  } catch (err) {
    console.error("[us-city-slugs] getUsCitySlugIndexCached failed:", err);
    return null;
  }
  const list = index.get(normalized);
  if (!list?.length) {
    return null;
  }

  return list[0] ?? null;
}

export async function listUsCityPathSegmentsForSitemap(): Promise<string[]> {
  const index = await getUsCitySlugIndexCached();
  return [...index.keys()].sort((a, b) => a.localeCompare(b, "en-US"));
}
