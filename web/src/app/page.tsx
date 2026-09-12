import { getServerUser } from "@/lib/supabase/server";
import { getFeaturedListings } from "@/lib/data/listings";
import { getCategories } from "@/lib/queries/category-server";
import { getCurrentUserCountry, getRegionsByCountry, getRegionById, getCityById, getCountryByCode } from "@/lib/queries/location-server";
import { getDomainCountryCode, getSeoCityMarketFromHost } from "@/lib/domain";
import { resolveCityPathPrefixFromCountry } from "@/lib/seo-city-market";
import type { Region } from "@/lib/types/location";
import { HomeListings } from "@/components/home-listings";

interface HomeProps {
  searchParams: Promise<{
    regionId?: string;
    cityId?: string;
    countryId?: string;
    categoryId?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const user = await getServerUser();
  const isAuthenticated = !!user;
  
  // Gerçek Supabase verilerini çek
  const allListings = await getFeaturedListings({
    countryId: params.countryId || null,
    regionId: params.regionId || null,
    cityId: params.cityId || null,
    categoryId: params.categoryId || null,
  });

  // Tüm ilanları göster (giriş yapmadan da)
  const listings = allListings;

  // Kategorileri herkes için göster
  const categories = await getCategories();

  // Location data'yı çek
  let country = await getCurrentUserCountry();
  if (!country) {
    const domainCode = await getDomainCountryCode();
    if (domainCode) {
      country = await getCountryByCode(domainCode);
    }
  }
  const domainMarket = await getSeoCityMarketFromHost();
  const cityPathPrefix = resolveCityPathPrefixFromCountry(country, domainMarket);
  let initialRegions: Region[] = [];
  if (country) {
    initialRegions = await getRegionsByCountry(country.id);
  }

  // Seçili region/city bilgilerini çek
  let selectedRegion = null;
  let selectedCity = null;
  
  if (params.cityId) {
    selectedCity = await getCityById(params.cityId);
    if (selectedCity?.region_id) {
      selectedRegion = await getRegionById(selectedCity.region_id);
    }
  } else if (params.regionId) {
    selectedRegion = await getRegionById(params.regionId);
  }

  return (
    <HomeListings 
      listings={listings} 
      categories={categories}
      country={country}
      regions={initialRegions}
      selectedRegion={selectedRegion}
      selectedCity={selectedCity}
      isAuthenticated={isAuthenticated}
      cityPathPrefix={cityPathPrefix}
    />
  );
}
