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

    // Database'de regions tablosunda country_id (UUID) var - direkt filtrele
    const { data: regions, error } = await supabase
      .from("regions")
      .select("id, name, country_id, code")
      .eq("country_id", countryId)
      .order("name", { ascending: true });

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

    return (regions || []) as Region[];
  } catch (err) {
    console.error("Unexpected error in getRegionsByCountry:", err);
    return [];
  }
}

export async function getCitiesByRegion(regionId: string): Promise<City[]> {
  const supabase = await createSupabaseServerClient();

  try {
    console.log("Fetching cities for region_id:", regionId);

    // Cities tablosundan region_id'ye göre şehirleri çek
    // Sadece database'de var olan field'ları select et
    const { data, error } = await supabase
      .from("cities")
      .select("id, name, region_id, country_code")
      .eq("region_id", regionId)
      .order("name", { ascending: true });

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

    // Direkt data döndür - mapping yok, type zaten doğru
    return (data || []) as City[];
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

