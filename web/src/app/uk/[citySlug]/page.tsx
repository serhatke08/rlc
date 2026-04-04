import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getFeaturedListings } from "@/lib/data/listings";
import { getCategories } from "@/lib/queries/category-server";
import {
  getCurrentUserCountry,
  getRegionsByCountry,
  getRegionById,
} from "@/lib/queries/location-server";
import { getUkCityBySlug } from "@/lib/queries/uk-city-slugs";
import { resolveCityMetaDescription, resolveCityPageIntro } from "@/lib/city-page-copy";
import { slugifyCityPathSegment } from "@/lib/slug";
import { HomeListings } from "@/components/home-listings";
import { getSiteUrlFromHeaders } from "@/lib/env";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
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
  const metaDesc = resolveCityMetaDescription(city);
  const canonical = `${base}${path}`;

  return {
    title: {
      absolute: `Free items in ${display} — ReloopCycle`,
    },
    description: metaDesc,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Free items in ${display} — ReloopCycle`,
      description: metaDesc,
      url: canonical,
      siteName: "ReloopCycle",
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Free items in ${display} — ReloopCycle`,
      description: metaDesc,
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
  const pageDescription = resolveCityPageIntro(city);

  const siteUrl = await getSiteUrlFromHeaders();
  const cityPath = `/uk/${canonicalSlug}`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: city.name, url: `${siteUrl}${cityPath}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-zinc-600">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="text-emerald-700 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-zinc-400">
            /
          </li>
          <li className="font-medium text-zinc-900">{city.name}</li>
        </ol>
      </nav>

      <HomeListings
        listings={allListings}
        categories={categories}
        country={country}
        regions={initialRegions}
        selectedRegion={selectedRegion}
        selectedCity={city}
        isAuthenticated={isAuthenticated}
        pageH1={pageH1}
        pageDescription={pageDescription}
        cityPathPrefix="uk"
      />
    </>
  );
}
