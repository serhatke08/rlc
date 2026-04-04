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
import { getCityMetaDescriptionFirst160, getCitySeoText } from "@/lib/uk-city-seo";
import { HomeListings } from "@/components/home-listings";
import { getSiteUrlFromHeaders } from "@/lib/env";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { jsonForClientBoundary } from "@/lib/rsc-serialize";
import { getServerUser } from "@/lib/supabase/server";
import type { Region } from "@/lib/types/location";

export const dynamic = "force-dynamic";

interface UkCityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export async function generateMetadata({ params }: UkCityPageProps): Promise<Metadata> {
  try {
    const { citySlug } = await params;
    const city = await getUkCityBySlug(citySlug);

    if (!city) {
      return {
        title: "Location",
        robots: { index: false, follow: false },
      };
    }

    const base = await getSiteUrlFromHeaders();
    const segment = city.slug ?? citySlug.toLowerCase();
    const path = `/uk/${segment}`;
    const title = `Free items in ${city.name} — ReloopCycle`;
    const description = getCityMetaDescriptionFirst160(segment, city.name);
    const canonical = `${base}${path}`;

    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "ReloopCycle",
        locale: "en_GB",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (err) {
    console.error("[uk-city] generateMetadata failed:", err);
    return {
      title: "Location",
      robots: { index: false, follow: false },
    };
  }
}

export default async function UkCityPage({ params, searchParams }: UkCityPageProps) {
  const { citySlug } = await params;
  const query = await searchParams;

  const city = await getUkCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  const segment = city.slug ?? citySlug.toLowerCase();
  if (citySlug.toLowerCase() !== segment.toLowerCase()) {
    const sp = new URLSearchParams();
    if (query.categoryId) sp.set("categoryId", query.categoryId);
    const q = sp.toString();
    permanentRedirect(q ? `/uk/${segment}?${q}` : `/uk/${segment}`);
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

  const seoBody = getCitySeoText(segment, city.name);

  const siteUrl = await getSiteUrlFromHeaders();
  const cityPath = `/uk/${segment}`;
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

      <header className="mb-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Free &amp; Swap Items in {city.name}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">{seoBody}</p>
      </header>

      <HomeListings
        listings={jsonForClientBoundary(allListings)}
        categories={jsonForClientBoundary(categories)}
        country={country ? jsonForClientBoundary(country) : null}
        regions={jsonForClientBoundary(initialRegions)}
        selectedRegion={selectedRegion ? jsonForClientBoundary(selectedRegion) : null}
        selectedCity={jsonForClientBoundary(city)}
        isAuthenticated={isAuthenticated}
        pageH1={null}
        pageDescription={null}
        cityPathPrefix="uk"
      />
    </>
  );
}
