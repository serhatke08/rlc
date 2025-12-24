import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Eye, 
  Heart, 
  User
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTimeFromNow } from "@/lib/formatters";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { MessageButton } from "@/components/listing-message-button";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { ListingReportButton } from "@/components/listing-report-button";
import { ListingBlockButton } from "@/components/listing-block-button";
import { ListingViewTracker } from "@/components/listing-view-tracker";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";
import { getSiteUrl } from "@/lib/env";

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  
  const { data: listing } = await supabase
    .from("listings")
    .select(`
      title,
      description,
      price,
      thumbnail_url,
      images,
      city:cities(name),
      region:regions(name),
      category:product_categories(name)
    `)
    .eq("id", id)
    .single();

  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  const listingData = listing as any;
  const imageUrl = listingData.thumbnail_url || listingData.images?.[0];
  const priceText = listingData.price === "0" || listingData.price === "0.00" ? "Free" : `£${listingData.price}`;
  const location = listingData.city?.name || "UK";
  const siteUrl = getSiteUrl();

  return {
    title: `${listingData.title} - ${priceText} in ${location}`,
    description: listingData.description.substring(0, 160),
    keywords: [
      listingData.title,
      location,
      listingData.category?.name || "Items",
      priceText === "Free" ? "free stuff" : "for sale",
      "UK",
      "reuse",
      "circular economy",
    ],
    alternates: {
      canonical: `${siteUrl}/listing/${id}`,
    },
    openGraph: {
      title: listingData.title,
      description: listingData.description.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
      type: "website",
      url: `${siteUrl}/listing/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: listingData.title,
      description: listingData.description.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  // Next.js 15: params is now a Promise
  const { id } = await params;
  
  const supabase = await createSupabaseServerClient();
  
  // Kullanıcı bilgisini al - giriş kontrolü
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Redirect non-authenticated users to login page
  if (!user) {
    redirect("/auth/login?redirect=/listing/" + id);
  }
  
  // Listing detaylarını çek
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles(id, username, display_name, avatar_url, reputation, joined_at),
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(name, slug)
    `)
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const listingData = listing as any;

  // Kullanıcının kendi ilanı mı kontrol et
  const isOwner = user?.id === listingData.seller_id;

  // View count will be handled client-side via API route with rate limiting
  // This prevents server-side view count manipulation

  const relativeTime = formatRelativeTimeFromNow(listingData.created_at);

  // Generate schemas
  const siteUrl = getSiteUrl();
  const productSchema = await generateProductSchema(id);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: listingData.category?.name || "Items", url: siteUrl },
    { name: listingData.title, url: `${siteUrl}/listing/${id}` },
  ]);

  return (
    <>
      {/* JSON-LD Schema */}
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
      
      {/* Track view count (client-side with rate limiting) */}
      <ListingViewTracker listingId={id} isOwner={isOwner} />
      
      <div className="min-h-screen bg-zinc-50">
      {/* Header */}
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
        {/* Görsel Galeri */}
        <ListingImageGallery
          images={listingData.images || []}
          thumbnailUrl={listingData.thumbnail_url}
          title={listingData.title}
        />

        {/* Kullanıcı Bilgisi */}
        {listingData.seller && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
            {listingData.seller.avatar_url ? (
              <img
                src={listingData.seller.avatar_url}
                alt={listingData.seller.display_name || listingData.seller.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
              <div className="flex-1">
              <p className="font-semibold text-zinc-900">
                {listingData.seller.display_name || listingData.seller.username}
              </p>
              <p className="text-sm text-zinc-500">@{listingData.seller.username}</p>
              </div>
              {!isOwner && (
                <div className="flex gap-2">
                  <ListingBlockButton
                    sellerId={listingData.seller_id}
                    currentUserId={user?.id || null}
                    isOwner={isOwner}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Açıklama */}
        <div className="mb-6">
          <h1 className="mb-3 text-2xl font-bold text-zinc-900">{listingData.title}</h1>
          <p className="whitespace-pre-line text-zinc-700">{listingData.description}</p>
        </div>

        {/* Lokasyon, Tarih ve İstatistikler - Tek Satır */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto text-xs text-zinc-600 md:gap-4 md:text-sm">
          <span className="inline-flex shrink-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {listingData.city?.name}
            {listingData.region && ` • ${listingData.region.name}`}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {new Date(listingData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {listingData.view_count || 0}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {listingData.favorite_count || 0}
          </span>
        </div>

        {/* Mesaj veya Düzenle Butonu ve Favori Butonu */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <MessageButton
              listingId={id}
              sellerId={listingData.seller_id}
              currentUserId={user?.id || null}
              isOwner={isOwner}
            />
          </div>
          {!isOwner && (
            <ListingFavoriteButton
              listingId={id}
              currentUserId={user?.id || null}
              isOwner={isOwner}
              initialFavoriteCount={listingData.favorite_count || 0}
            />
          )}
        </div>

        {/* Report Butonu */}
        {!isOwner && (
          <div className="flex justify-center">
            <ListingReportButton
              listingId={id}
              sellerId={listingData.seller_id}
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

