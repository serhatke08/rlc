import { getCurrentUserCountry, getRegionsByCountry } from "@/lib/queries/location-server";
import type { Region } from "@/lib/types/location";
import { LocationMenu } from "@/components/location-menu";
import { getSeoCityMarketFromHost } from "@/lib/domain";
import { resolveCityPathPrefixFromCountry } from "@/lib/seo-city-market";

export async function LocationMenuWrapper() {
  const country = await getCurrentUserCountry();

  let initialRegions: Region[] = [];
  if (country) {
    initialRegions = await getRegionsByCountry(country.id);
  }

  if (!country) {
    return null;
  }

  const domainMarket = await getSeoCityMarketFromHost();
  const cityPathPrefix = resolveCityPathPrefixFromCountry(country, domainMarket);

  return (
    <LocationMenu
      initialCountry={country}
      initialRegions={initialRegions}
      cityPathPrefix={cityPathPrefix}
    />
  );
}

