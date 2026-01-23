import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Country, Region, City } from "@/lib/types/location";

// Server-side queries (only use in Server Components)
export async function getCurrentUserCountry(): Promise<Country | null> {
  const supabase = await createSupabaseServerClient();
  
  try {
    // Get current user - silently handle missing session (user not logged in)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // AuthSessionMissingError is expected when user is not logged in - don't log as error
    if (userError) {
      // Only log if it's not a session missing error (which is normal for anonymous users)
      if (userError.name !== "AuthSessionMissingError" && userError.status !== 400) {
        console.error("Error getting user:", JSON.stringify(userError, null, 2));
      }
      return null;
    }

    if (!user) {
      return null;
    }

    // Get user's profile with country
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("country_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", JSON.stringify(profileError, null, 2));
      return null;
    }

    // Type assertion for profile
    const profileData = profile as { country_id?: string } | null;

    if (!profileData?.country_id) {
      console.log("User has no country_id in profile");
      return null;
    }

    // Get country details
    const { data: country, error: countryError } = await supabase
      .from("countries")
      .select("id, name, code, flag_emoji")
      .eq("id", profileData.country_id)
      .single();

    if (countryError) {
      console.error("Error fetching country:", JSON.stringify(countryError, null, 2));
      return null;
    }

    return country as Country | null;
  } catch (err) {
    console.error("Unexpected error in getCurrentUserCountry:", err);
    return null;
  }
}

export async function getRegionsByCountry(countryId: string): Promise<Region[]> {
  const supabase = await createSupabaseServerClient();

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
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
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
    console.error("Unexpected error in getRegionsByCountry:", err);
    return [];
  }
}

export async function getCitiesByRegion(regionId: string): Promise<City[]> {
  const supabase = await createSupabaseServerClient();

  try {
    console.log("Fetching cities for region_id:", regionId);

    // Use cities_full_info view to get cities with full info
    const { data, error } = await supabase
      .from("cities_full_info")
      .select("city_id, city_name, region_id, country_id")
      .eq("region_id", regionId)
      .order("city_name", { ascending: true });

    if (error) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    console.log("Cities fetched:", data?.length || 0, "cities for region", regionId);

    // Map view columns to City interface
    return (data || []).map((c: any) => ({
      id: c.city_id,
      name: c.city_name,
      region_id: c.region_id,
      country_id: c.country_id,
    })) as City[];
  } catch (err) {
    console.error("Unexpected error in getCitiesByRegion:", err);
    return [];
  }
}

export async function getRegionById(regionId: string): Promise<Region | null> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("regions")
      .select("id, name, country_id, code")
      .eq("id", regionId)
      .single();

    if (error) {
      console.error("Error fetching region:", JSON.stringify(error, null, 2));
      return null;
    }

    return data as Region | null;
  } catch (err) {
    console.error("Unexpected error in getRegionById:", err);
    return null;
  }
}

export async function getCityById(cityId: string): Promise<City | null> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name, region_id, country_id")
      .eq("id", cityId)
      .single();

    if (error) {
      console.error("Error fetching city:", JSON.stringify(error, null, 2));
      return null;
    }

    return data as City | null;
  } catch (err) {
    console.error("Unexpected error in getCityById:", err);
    return null;
  }
}

/**
 * England region'ını bulur (GB country'sine ait)
 * Domain bazlı filtreleme için kullanılır
 */
export async function getEnglandRegion(): Promise<Region | null> {
  const supabase = await createSupabaseServerClient();

  try {
    // Önce GB country'sini bul
    const { data: country, error: countryError } = await supabase
      .from("countries")
      .select("id")
      .eq("code", "GB")
      .single();

    if (countryError || !country) {
      console.error("[getEnglandRegion] Error fetching GB country:", countryError);
      return null;
    }

    // Type assertion for country
    const countryData = country as { id: string } | null;
    if (!countryData?.id) {
      console.error("[getEnglandRegion] GB country ID not found");
      return null;
    }

    console.log("[getEnglandRegion] GB country ID:", countryData.id);

    // GB country'sine ait England region'ını bul - önce tam eşleşme dene
    let { data: region, error: regionError } = await supabase
      .from("regions")
      .select("id, name, country_id, code")
      .eq("country_id", countryData.id)
      .eq("name", "England")
      .single();

    // Eğer bulunamazsa, code ile dene
    if (regionError) {
      console.log("[getEnglandRegion] England not found by name, trying by code...");
      const { data: regionByCode, error: codeError } = await supabase
        .from("regions")
        .select("id, name, country_id, code")
        .eq("country_id", countryData.id)
        .eq("code", "ENG")
        .single();
      
      if (codeError || !regionByCode) {
        console.error("[getEnglandRegion] Error fetching England region by code:", codeError);
        // Son çare: GB country'sine ait tüm region'ları listele
        const { data: allRegions, error: allError } = await supabase
          .from("regions")
          .select("id, name, country_id, code")
          .eq("country_id", countryData.id)
          .limit(10);
        
        if (allError) {
          console.error("[getEnglandRegion] Error fetching all regions:", allError);
          return null;
        }
        
        console.log("[getEnglandRegion] Available regions for GB:", allRegions);
        return null;
      }
      
      region = regionByCode;
      regionError = null;
    }

    if (regionError) {
      console.error("[getEnglandRegion] Error fetching England region:", regionError);
      return null;
    }

    console.log("[getEnglandRegion] Found England region:", region);
    return region as Region | null;
  } catch (err) {
    console.error("Unexpected error in getEnglandRegion:", err);
    return null;
  }
}
