import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getFeaturedListings } from "@/lib/data/listings";
import { getCategories } from "@/lib/queries/category-server";
import {
  getCurrentUserCountry,
  getRegionsByCountry,
  getRegionById,
} from "@/lib/queries/location-server";
import { getUkCityBySlug } from "@/lib/queries/uk-city-slugs";
import { slugifyCityPathSegment } from "@/lib/slug";
import { HomeListings } from "@/components/home-listings";
import { getSiteUrlFromHeaders } from "@/lib/env";
import { getServerUser } from "@/lib/supabase/server";
import type { Region } from "@/lib/types/location";

interface UkCityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export async function generateMetadata({ params }: UkCityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await getUkCityBySlug(citySlug);

  if (!city) {
    return {
      title: "Location",
      robots: { index: false, follow: false },
    };
  }

  const base = await getSiteUrlFromHeaders();
  const path = `/uk/${slugifyCityPathSegment(city.name)}`;
  const display = city.name;

  return {
    title: {
      absolute: `Free items in ${display} — ReloopCycle`,
    },
    description: `Give, get or swap free items in ${display} on ReloopCycle. Join your local community.`,
    alternates: {
      canonical: `${base}${path}`,
    },
  };
}

export default async function UkCityPage({ params, searchParams }: UkCityPageProps) {
  const { citySlug } = await params;
  const query = await searchParams;

  const city = await getUkCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  const canonicalSlug = slugifyCityPathSegment(city.name);
  if (citySlug !== canonicalSlug) {
    const sp = new URLSearchParams();
    if (query.categoryId) sp.set("categoryId", query.categoryId);
    const q = sp.toString();
    permanentRedirect(q ? `/uk/${canonicalSlug}?${q}` : `/uk/${canonicalSlug}`);
  }

  const user = await getServerUser();
  const isAuthenticated = !!user;

  const allListings = await getFeaturedListings({
    countryId: null,
    regionId: null,
    cityId: city.id,
    categoryId: query.categoryId || null,
  });

  const categories = await getCategories();
  const country = await getCurrentUserCountry();

  let initialRegions: Region[] = [];
  if (country) {
    initialRegions = await getRegionsByCountry(country.id);
  }

  const selectedRegion = await getRegionById(city.region_id);

  const pageH1 = `Free & Swap Items in ${city.name}`;

  return (
    <HomeListings
      listings={allListings}
      categories={categories}
      country={country}
      regions={initialRegions}
      selectedRegion={selectedRegion}
      selectedCity={city}
      isAuthenticated={isAuthenticated}
      pageH1={pageH1}
      cityPathPrefix="uk"
    />
  );
}
