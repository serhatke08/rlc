import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Region, City, Country } from "@/lib/types/location";

// Client-side queries (only use in Client Components)
export async function fetchRegionsByCountry(countryId: string): Promise<Region[]> {
  const supabase = createSupabaseBrowserClient();

  try {
    console.log("Fetching regions for country_id:", countryId);

    // Use regions_full_info view to get regions with city counts
    const { data: regions, error } = await supabase
      .from("regions_full_info")
      .select("region_id, region_name, region_code, country_id, cities_count")
      .eq("country_id", countryId)
      .order("region_name", { ascending: true });

    if (error) {
      console.error("Error fetching regions:", JSON.stringify(error, null, 2));
      return [];
    }

    console.log("Regions fetched:", regions?.length || 0, "regions");

    // Map view columns to Region interface
    return (regions || []).map((r: any) => ({
      id: r.region_id,
      name: r.region_name,
      code: r.region_code,
      country_id: r.country_id,
      cities_count: r.cities_count,
    })) as Region[];
  } catch (err) {
    console.error("Unexpected error in fetchRegionsByCountry:", err);
    return [];
  }
}

export async function fetchCitiesByRegion(regionId: string): Promise<City[]> {
  console.log("🔍 [fetchCitiesByRegion] Fetching for regionId:", regionId);
  
  const res = await fetch(`/api/cities/${regionId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    console.error("❌ [fetchCitiesByRegion] Error:", err);
    throw new Error(err.error ?? "Unknown error");
  }

  const data = await res.json();

  // API route returns either:
  // - direct array of cities: City[]
  // - (legacy) wrapped object: { cities: City[] }
  const cities = Array.isArray(data) ? data : (data?.cities ?? []);

  console.log("✅ [fetchCitiesByRegion] Cities loaded:", cities?.length || 0);
  return cities as City[];
}

export async function fetchUkNationCountries(): Promise<Country[]> {
  const supabase = createSupabaseBrowserClient();

  try {
    // Be sure to work even if DB country codes differ (e.g. SCT/WLS/NIR vs variants).
    // We'll fetch a small list and filter in JS.
    const { data, error } = await supabase
      .from("countries")
      .select("id, name, code, flag_emoji")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching UK nation countries:", JSON.stringify(error, null, 2));
      return [];
    }

    const items = (data || []) as Country[];
    return items.filter((c) => {
      const code = (c.code || "").toUpperCase();
      const name = (c.name || "").toLowerCase();

      const isNation =
        code === "SCT" ||
        code === "WLS" ||
        code === "NIR" ||
        name.includes("scotland") ||
        name.includes("wales") ||
        name.includes("northern ireland") ||
        name === "scotland" ||
        name === "wales" ||
        name === "northern ireland";

      return isNation;
    });
  } catch (err) {
    console.error("Unexpected error in fetchUkNationCountries:", err);
    return [];
  }
}

