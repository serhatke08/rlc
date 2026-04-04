import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { getSiteUrlFromHeaders } from "@/lib/env";
import { allocateUniqueListingSlug } from "@/lib/listing-slug-server";
import { resolveCityDisplayNameForListingSlug } from "@/lib/listing-slug-resolve";
import { listingPublicPath } from "@/lib/listing-url";
import {
  computeSeoPathForExistingListing,
  persistListingSeoPath,
} from "@/lib/listing-seo-path-server";
import { ListingDetailView } from "@/components/listing-detail-view";
import { LISTING_PAGE_DETAIL_SELECT } from "@/lib/listing-detail-query";

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidParam(s: string): boolean {
  return UUID_RE.test(s);
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const supabase = await createSupabaseServerClient();
  const baseUrl = await getSiteUrlFromHeaders();

  const metaSelect = `
    title,
    description,
    price,
    thumbnail_url,
    images,
    slug,
    seo_path,
    id,
    city:cities(name),
    region:regions(name),
    category:product_categories(name)
  `;

  let listingForMeta = null;
  if (isUuidParam(raw)) {
    const { data } = await supabase.from("listings").select(metaSelect).eq("id", raw).maybeSingle();
    listingForMeta = data;
  } else {
    const { data } = await supabase.from("listings").select(metaSelect).eq("slug", raw).maybeSingle();
    listingForMeta = data;
  }

  if (!listingForMeta) {
    return {
      title: "Listing Not Found",
    };
  }

  const listingData = listingForMeta as Record<string, unknown>;
  const imageUrl = listingData.thumbnail_url || (listingData.images as string[])?.[0];
  const priceText =
    listingData.price === "0" || listingData.price === "0.00" ? "Free" : `£${listingData.price}`;
  const city = listingData.city as { name?: string } | undefined;
  const location = city?.name || "UK";
  const publicPath = listingPublicPath({
    id: String(listingData.id),
    slug: (listingData.slug as string | null) ?? null,
    seo_path: (listingData.seo_path as string | null) ?? null,
  });

  return {
    title: `${listingData.title} - ${priceText} in ${location}`,
    description: String(listingData.description || "").substring(0, 160),
    keywords: [
      String(listingData.title),
      location,
      (listingData.category as { name?: string } | undefined)?.name || "Items",
      priceText === "Free" ? "free stuff" : "for sale",
      "UK",
      "reuse",
      "circular economy",
    ],
    alternates: {
      canonical: `${baseUrl}${publicPath}`,
    },
    openGraph: {
      title: String(listingData.title),
      description: String(listingData.description || "").substring(0, 160),
      images: imageUrl ? [String(imageUrl)] : [],
      type: "website",
      url: `${baseUrl}${publicPath}`,
    },
    twitter: {
      card: "summary_large_image",
      title: String(listingData.title),
      description: String(listingData.description || "").substring(0, 160),
      images: imageUrl ? [String(imageUrl)] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug: raw } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isUuidParam(raw)) {
    const { data: byId, error: idErr } = await supabase
      .from("listings")
      .select("id, slug, seo_path, title, city_name, city_id")
      .eq("id", raw)
      .maybeSingle();

    const short = byId as
      | {
          id: string;
          slug: string | null;
          seo_path: string | null;
          title: string;
          city_name: string;
          city_id: string | null;
        }
      | null;

    if (idErr || !short) {
      notFound();
    }

    if (short.seo_path) {
      permanentRedirect(`/${short.seo_path}`);
    }

    const computed = await computeSeoPathForExistingListing(short.id);
    if (computed) {
      const saved = await persistListingSeoPath(short.id, computed);
      if (saved) {
        permanentRedirect(`/${computed}`);
      }
    }

    if (short.slug) {
      permanentRedirect(`/listing/${short.slug}`);
    }

    const cityLabel = await resolveCityDisplayNameForListingSlug(short.city_id, short.city_name);
    const newSlug = await allocateUniqueListingSlug(short.title, cityLabel, short.id);
    await (supabase.from("listings") as any).update({ slug: newSlug }).eq("id", short.id);

    const afterSlug = await computeSeoPathForExistingListing(short.id);
    if (afterSlug) {
      const saved = await persistListingSeoPath(short.id, afterSlug);
      if (saved) {
        permanentRedirect(`/${afterSlug}`);
      }
    }

    permanentRedirect(`/listing/${newSlug}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(LISTING_PAGE_DETAIL_SELECT)
    .eq("slug", raw)
    .single();

  if (error || !listing) {
    notFound();
  }

  const listingData = listing as Record<string, unknown>;
  const id = listingData.id as string;

  if (listingData.seo_path) {
    permanentRedirect(`/${listingData.seo_path as string}`);
  }

  const computedPath = await computeSeoPathForExistingListing(id);
  if (computedPath) {
    const saved = await persistListingSeoPath(id, computedPath);
    if (saved) {
      permanentRedirect(`/${computedPath}`);
    }
  }

  const isOwner = user ? user.id === listingData.seller_id : false;

  const siteUrl = await getSiteUrlFromHeaders();
  const publicPath = listingPublicPath({
    id,
    slug: listingData.slug as string | null,
    seo_path: listingData.seo_path as string | null,
  });
  const productSchema = await generateProductSchema(id);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: (listingData.category as { name?: string } | null)?.name || "Items", url: siteUrl },
    {
      name: String(listingData.title),
      url: `${siteUrl}${publicPath}`,
    },
  ]);

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ListingDetailView
        listingData={listingData}
        id={id}
        isOwner={isOwner}
        currentUserId={user?.id ?? null}
      />
    </>
  );
}
