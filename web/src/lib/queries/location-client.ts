import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Region, City } from "@/lib/types/location";

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
  console.log("✅ [fetchCitiesByRegion] Cities loaded:", data.cities?.length || 0);
  return data.cities || [];
}

