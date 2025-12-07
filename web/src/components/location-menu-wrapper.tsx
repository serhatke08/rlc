import { getCurrentUserCountry, getRegionsByCountry } from "@/lib/queries/location-server";
import type { Region } from "@/lib/types/location";
import { LocationMenu } from "@/components/location-menu";

export async function LocationMenuWrapper() {
  // Get current user's country (null if not logged in)
  const country = await getCurrentUserCountry();
  
  // If user has a country, fetch regions for initial load
  let initialRegions: Region[] = [];
  if (country) {
    initialRegions = await getRegionsByCountry(country.id);
  }

  // Only render if user has a country
  if (!country) {
    return null;
  }

  return (
    <LocationMenu 
      initialCountry={country} 
      initialRegions={initialRegions} 
    />
  );
}

