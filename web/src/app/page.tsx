import { getFeaturedListings } from "@/lib/data/listings";
import { HomeListings } from "@/components/home-listings";

export default async function Home() {
  // Gerçek Supabase verilerini çek
  const listings = await getFeaturedListings();

  return <HomeListings listings={listings} />;
}
