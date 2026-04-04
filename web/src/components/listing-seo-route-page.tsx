import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingDetailView } from "@/components/listing-detail-view";
import { LISTING_PAGE_DETAIL_SELECT } from "@/lib/listing-detail-query";
import { listingPublicPath } from "@/lib/listing-url";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { getSiteUrlFromHeaders } from "@/lib/env";
import type { ListingMarket } from "@/lib/listing-seo-path";

const META_SELECT = `
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

export async function generateListingSeoMetadata({
  params,
  market,
}: {
  params: Promise<{ citySlug: string; intent: string; categorySlug: string; itemSlug: string }>;
  market: ListingMarket;
}): Promise<Metadata> {
  const p = await params;
  const seo_path = `${market}/${p.citySlug}/${p.intent}/${p.categorySlug}/${p.itemSlug}`;
  const supabase = await createSupabaseServerClient();
  const baseUrl = await getSiteUrlFromHeaders();

  const { data: listingForMeta } = await supabase
    .from("listings")
    .select(META_SELECT)
    .eq("seo_path", seo_path)
    .maybeSingle();

  if (!listingForMeta) {
    return { title: "Listing Not Found" };
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

export async function ListingSeoRoutePage({
  params,
  market,
}: {
  params: Promise<{ citySlug: string; intent: string; categorySlug: string; itemSlug: string }>;
  market: ListingMarket;
}) {
  const p = await params;
  const seo_path = `${market}/${p.citySlug}/${p.intent}/${p.categorySlug}/${p.itemSlug}`;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("listings")
    .select(LISTING_PAGE_DETAIL_SELECT)
    .eq("seo_path", seo_path)
    .single();

  if (error || !listing) {
    notFound();
  }

  const listingData = listing as Record<string, unknown>;
  const id = listingData.id as string;
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
