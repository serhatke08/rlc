import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFeaturedListings } from "@/lib/data/listings";
import { getCategories } from "@/lib/queries/category-server";
import { getCurrentUserCountry, getRegionsByCountry, getRegionById, getCityById } from "@/lib/queries/location-server";
import { HomeListings } from "@/components/home-listings";

interface HomeProps {
  searchParams: Promise<{
    regionId?: string;
    cityId?: string;
    categoryId?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  
  const supabase = await createSupabaseServerClient();
  
  // Giriş kontrolü - kategorileri sadece giriş yapmış kullanıcılar için göster
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const isAuthenticated = !userError && !!user;
  
  // Gerçek Supabase verilerini çek
  const listings = await getFeaturedListings({
    regionId: params.regionId || null,
    cityId: params.cityId || null,
    categoryId: params.categoryId || null,
  });

  // Kategorileri sadece giriş yapmış kullanıcılar için çek
  const categories = isAuthenticated ? await getCategories() : [];

  // Location data'yı çek
  const country = await getCurrentUserCountry();
  let initialRegions = [];
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
    />
  );
}
