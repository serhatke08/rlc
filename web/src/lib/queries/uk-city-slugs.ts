import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { City } from "@/lib/types/location";
import { isValidCitySlugFormat } from "@/lib/slug";

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

/** UK şehri: `cities` (id, name, slug, region_id) — UK bölgeleriyle kesişim. */
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

    const { data: row, error } = await supabase
      .from("cities")
      .select(`
        id,
        name,
        slug,
        region_id,
        regions!inner (
          country_id
        )
      `)
      .eq("slug", normalized)
      .in("region_id", regionIds)
      .maybeSingle();

    if (error || !row) {
      if (error) console.error("[uk-city-slugs] cities query failed:", error);
      return null;
    }

    const r = row as {
      id: string;
      name: string;
      slug: string;
      region_id: string | null;
      regions: { country_id: string } | null;
    };

    if (!r.region_id || !r.regions?.country_id) {
      return null;
    }

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      region_id: r.region_id,
      country_id: r.regions.country_id,
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

    const slugs = [
      ...new Set(
        (cities ?? [])
          .map((c) => (c as { slug: string }).slug)
          .filter((s): s is string => typeof s === "string" && s.length > 0),
      ),
    ];
    return slugs.sort((a, b) => a.localeCompare(b, "en-GB"));
  } catch (err) {
    console.error("[uk-city-slugs] listUkCityPathSegmentsForSitemap failed:", err);
    return [];
  }
}
