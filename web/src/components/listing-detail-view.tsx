import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  Heart,
  User,
} from "lucide-react";

import { MessageButton } from "@/components/listing-message-button";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { ListingReportButton } from "@/components/listing-report-button";
import { ListingBlockButton } from "@/components/listing-block-button";
import { ListingViewTracker } from "@/components/listing-view-tracker";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";

type SellerRow = {
  avatar_url?: string | null;
  display_name?: string | null;
  username: string;
};

export function ListingDetailView(props: {
  listingData: Record<string, unknown>;
  id: string;
  isOwner: boolean;
  currentUserId: string | null;
}) {
  const { listingData, id, isOwner, currentUserId } = props;
  const seller = listingData.seller as SellerRow | null | undefined;

  return (
    <>
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
                      currentUserId={currentUserId}
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
                currentUserId={currentUserId}
                isOwner={isOwner}
              />
            </div>
            {!isOwner && (
              <ListingFavoriteButton
                listingId={id}
                currentUserId={currentUserId}
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
                currentUserId={currentUserId}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
