import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { City } from "@/lib/types/location";
import { isValidCitySlugFormat, slugifyCityPathSegment } from "@/lib/slug";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function fetchUnitedKingdomCountryIds(supabase: SupabaseServer): Promise<string[]> {
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

async function resolveCountryIdForRegion(
  supabase: SupabaseServer,
  regionId: string,
): Promise<string | null> {
  const { data, error } = await supabase.from("regions").select("country_id").eq("id", regionId).maybeSingle();
  if (error || !data) return null;
  return (data as { country_id: string }).country_id ?? null;
}

/**
 * UK şehir sayfası: `cities.slug` veya isimden türetilen slug ile eşleşme.
 * PostgREST `regions!inner` embed bazı projelerde hata verdiği için embed kullanılmaz.
 */
export async function getUkCityBySlug(pathSlug: string): Promise<City | null> {
  const normalized = pathSlug.toLowerCase().trim();
  if (!isValidCitySlugFormat(normalized)) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const countryIds = await fetchUnitedKingdomCountryIds(supabase);
    if (!countryIds.length) {
      return null;
    }

    const { data: regionRows, error: re } = await supabase
      .from("regions")
      .select("id")
      .in("country_id", countryIds);

    if (re || !regionRows?.length) {
      return null;
    }

    const regionIds = (regionRows as { id: string }[]).map((r) => r.id);

    const { data: rowRaw, error } = await supabase
      .from("cities")
      .select("id, name, slug, region_id")
      .eq("slug", normalized)
      .in("region_id", regionIds)
      .maybeSingle();

    if (error) {
      console.error("[uk-city-slugs] cities query failed:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }

    const row = rowRaw as { id: string; name: string; slug: string; region_id: string | null } | null;

    if (row?.region_id) {
      const cid = await resolveCountryIdForRegion(supabase, row.region_id);
      if (cid) {
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          region_id: row.region_id,
          country_id: cid,
        };
      }
    }

    const { data: infoRows, error: infoErr } = await supabase
      .from("cities_full_info")
      .select("city_id, city_name, region_id, country_id")
      .in("region_id", regionIds);

    if (infoErr || !infoRows?.length) {
      if (infoErr) console.error("[uk-city-slugs] cities_full_info fallback failed:", JSON.stringify(infoErr, Object.getOwnPropertyNames(infoErr)));
      return null;
    }

    const match = (infoRows as { city_id: string; city_name: string; region_id: string; country_id: string }[]).find(
      (c) => slugifyCityPathSegment(c.city_name) === normalized,
    );

    if (!match) {
      return null;
    }

    return {
      id: match.city_id,
      name: match.city_name,
      slug: normalized,
      region_id: match.region_id,
      country_id: match.country_id,
    };
  } catch (err) {
    console.error("[uk-city-slugs] getUkCityBySlug failed:", err);
    return null;
  }
}

/** Sitemap: UK bölgelerindeki şehir slug'ları (path segment). */
export async function listUkCityPathSegmentsForSitemap(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const countryIds = await fetchUnitedKingdomCountryIds(supabase);
    if (!countryIds.length) return [];

    const { data: regionRows } = await supabase
      .from("regions")
      .select("id")
      .in("country_id", countryIds);

    const regionIds = (regionRows as { id: string }[] | null)?.map((x) => x.id) ?? [];
    if (!regionIds.length) return [];

    const { data: cities, error } = await supabase.from("cities").select("slug").in("region_id", regionIds);

    if (error) {
      console.error("[uk-city-slugs] listUkCityPathSegmentsForSitemap failed:", error);
      return [];
    }

    const fromSlug = (cities ?? [])
      .map((c) => (c as { slug: string }).slug)
      .filter((s): s is string => typeof s === "string" && s.length > 0);

    const { data: infoRows } = await supabase
      .from("cities_full_info")
      .select("city_name")
      .in("region_id", regionIds);

    const fromNames = (infoRows ?? []).map((r) => slugifyCityPathSegment((r as { city_name: string }).city_name)).filter(Boolean);

    return [...new Set([...fromSlug, ...fromNames])].sort((a, b) => a.localeCompare(b, "en-GB"));
  } catch (err) {
    console.error("[uk-city-slugs] listUkCityPathSegmentsForSitemap failed:", err);
    return [];
  }
}
