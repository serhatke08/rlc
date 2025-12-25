'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, MapPin, Heart, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FeaturedListing } from "@/types/listing";

interface ListingCardProps {
  listing: FeaturedListing;
}

const STATUS_STYLES: Record<FeaturedListing["status"], string> = {
  available: "bg-emerald-100 text-emerald-900",
  reserved: "bg-amber-100 text-amber-900",
  claimed: "bg-zinc-200 text-zinc-900",
  pending: "bg-sky-100 text-sky-900",
};

const TYPE_META: Record<
  FeaturedListing["listingType"],
  { label: string; className: string }
> = {
  give: { label: "Free", className: "bg-emerald-600 text-white" },
  swap: { label: "Swap", className: "bg-sky-600 text-white" },
  lend: { label: "Lend", className: "bg-indigo-600 text-white" },
  sell: { label: "Sale", className: "bg-orange-500 text-white" },
  need: { label: "I Need", className: "bg-purple-600 text-white" },
  adoption: { label: "Adoption", className: "bg-cyan-600 text-white" },
};

export function ListingCard({ listing }: ListingCardProps) {
  const cover = listing.coverImage;
  const seller = listing.seller;

  // View count is tracked on the listing detail page via ListingViewTracker component
  // No need to track views on card clicks - this avoids inflating view counts

  return (
    <Link 
      href={`/listing/${listing.id}`}
      className="block"
    >
      <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-100 ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-lg hover:ring-emerald-300/60 cursor-pointer">
        <div className="relative overflow-hidden rounded-xl aspect-square">
          {cover ? (
            <Image
              src={cover}
              alt={listing.title}
              width={400}
              height={400}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white" />
          )}
          {/* Listing Type Badge - Top Left */}
          <div
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow",
              TYPE_META[listing.listingType]?.className ?? "bg-emerald-600 text-white",
            )}
          >
            {TYPE_META[listing.listingType]?.label ?? "Free"}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-3">
          {/* Seller Info - Fotoğrafın hemen altında */}
          {seller && (
            <div className="flex items-center gap-2">
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt={seller.display_name || seller.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                  <User className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-xs font-medium text-zinc-700">
                {seller.display_name || seller.username}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
              {listing.category}
            </p>
            <h3 className="text-sm font-semibold leading-tight text-zinc-900 line-clamp-2">
              {listing.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{listing.city}</span>
            </span>
          </div>

          {/* Description - En altta */}
          <p className="line-clamp-2 text-xs text-zinc-600">{listing.description}</p>

          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-200/60 px-2 py-0.5 text-[10px] font-medium text-emerald-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {listing.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {listing.favorites}
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:text-emerald-600" />
          </div>
        </div>
      </article>
    </Link>
  );
}

