import { getFeaturedListings } from "@/lib/data/listings";
import { HomeListings } from "@/components/home-listings";

interface HomeProps {
  searchParams: Promise<{
    regionId?: string;
    cityId?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  
  // Gerçek Supabase verilerini çek
  const listings = await getFeaturedListings({
    regionId: params.regionId || null,
    cityId: params.cityId || null,
  });

  return <HomeListings listings={listings} />;
}
