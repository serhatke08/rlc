import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  Heart,
  User,
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { MessageButton } from "@/components/listing-message-button";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { ListingReportButton } from "@/components/listing-report-button";
import { ListingBlockButton } from "@/components/listing-block-button";
import { ListingViewTracker } from "@/components/listing-view-tracker";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";
import { getSiteUrlFromHeaders } from "@/lib/env";
import { allocateUniqueListingSlug } from "@/lib/listing-slug-server";
import { listingPublicPath } from "@/lib/listing-url";

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
  const pathSegment =
    (listingData.slug as string) ||
    (listingData.id ? String(listingData.id) : raw);

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
      canonical: `${baseUrl}/listing/${pathSegment}`,
    },
    openGraph: {
      title: String(listingData.title),
      description: String(listingData.description || "").substring(0, 160),
      images: imageUrl ? [String(imageUrl)] : [],
      type: "website",
      url: `${baseUrl}/listing/${pathSegment}`,
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
      .select("id, slug, title, city_name")
      .eq("id", raw)
      .maybeSingle();

    const short = byId as
      | { id: string; slug: string | null; title: string; city_name: string }
      | null;

    if (idErr || !short) {
      notFound();
    }

    if (short.slug) {
      permanentRedirect(`/listing/${short.slug}`);
    }

    const newSlug = await allocateUniqueListingSlug(
      short.title,
      short.city_name || "",
      short.id,
    );
    await (supabase.from("listings") as any).update({ slug: newSlug }).eq("id", short.id);
    permanentRedirect(`/listing/${newSlug}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      seller:profiles(id, username, display_name, avatar_url, reputation, joined_at),
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(name, slug)
    `,
    )
    .eq("slug", raw)
    .single();

  if (error || !listing) {
    notFound();
  }

  const listingData = listing as Record<string, unknown>;
  const id = listingData.id as string;

  type SellerRow = {
    avatar_url?: string | null;
    display_name?: string | null;
    username: string;
  };
  const seller = listingData.seller as SellerRow | null | undefined;

  const isOwner = user ? user.id === listingData.seller_id : false;

  const siteUrl = await getSiteUrlFromHeaders();
  const publicPath = listingPublicPath({
    id,
    slug: listingData.slug as string | null,
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

      <ListingViewTracker listingId={id} isOwner={isOwner} />

      <div className="min-h-screen bg-zinc-50">
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          <ListingImageGallery
            images={(listingData.images as string[]) || []}
            thumbnailUrl={listingData.thumbnail_url as string | null}
            title={String(listingData.title)}
          />

          {seller ? (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.display_name || seller.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">
                    {seller.display_name || seller.username}
                  </p>
                  <p className="text-sm text-zinc-500">@{seller.username}</p>
                </div>
                {!isOwner && (
                  <div className="flex gap-2">
                    <ListingBlockButton
                      sellerId={listingData.seller_id as string}
                      currentUserId={user?.id || null}
                      isOwner={isOwner}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="mb-6">
            <h1 className="mb-3 text-2xl font-bold text-zinc-900">{String(listingData.title)}</h1>
            <p className="whitespace-pre-line text-zinc-700">{String(listingData.description)}</p>
          </div>

          <div className="mb-6 flex items-center gap-3 overflow-x-auto text-xs text-zinc-600 md:gap-4 md:text-sm">
            <span className="inline-flex shrink-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {(listingData.city as { name?: string } | null)?.name}
              {listingData.region
                ? ` • ${(listingData.region as { name: string }).name}`
                : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {new Date(listingData.created_at as string).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {(listingData.view_count as number) || 0}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {(listingData.favorite_count as number) || 0}
            </span>
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <MessageButton
                listingId={id}
                sellerId={listingData.seller_id as string}
                currentUserId={user?.id || null}
                isOwner={isOwner}
              />
            </div>
            {!isOwner && (
              <ListingFavoriteButton
                listingId={id}
                currentUserId={user?.id || null}
                isOwner={isOwner}
                initialFavoriteCount={(listingData.favorite_count as number) || 0}
              />
            )}
          </div>

          {!isOwner && (
            <div className="flex justify-center">
              <ListingReportButton
                listingId={id}
                sellerId={listingData.seller_id as string}
                currentUserId={user?.id || null}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
