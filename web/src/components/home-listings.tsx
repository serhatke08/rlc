'use client';

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListingFilterPills } from "@/components/listings/filter-pills";
import { CategoryFilters } from "@/components/listings/category-filters";
import { RegionScroller } from "@/components/listings/region-scroller";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

interface HomeListingsProps {
  listings: FeaturedListing[];
}

export function HomeListings({ listings }: HomeListingsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('gallery');

  // Filtrelenmiş listeler (sadece tip ve kategori - region/şehir server-side yapılıyor)
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Tip filtresi (listing_type metadata'dan gelir)
      if (activeFilter !== "all") {
        const typeMap: Record<string, string> = {
          free: "give",
          swap: "swap",
          sale: "sell",
          need: "need",
          adoption: "adoption",
        };
        
        if (listing.listingType !== typeMap[activeFilter]) {
          return false;
        }
      }

      // Kategori filtresi
      if (selectedCategory && listing.categoryId !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [listings, activeFilter, selectedCategory]);

  return (
    <div className="py-12">
      <section className="space-y-4">
        <ListingFilterPills 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <CategoryFilters
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <RegionScroller 
          activeRegion={null}
          onRegionChange={() => {}}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          Latest Listings
          {(activeFilter !== "all" || selectedCategory) && (
            <span className="ml-2 text-base font-normal text-zinc-500">
              ({filteredListings.length} results)
            </span>
          )}
        </h2>
        {filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-sm text-zinc-600">No listings found for these filters.</p>
          </div>
        ) : viewMode === 'gallery' ? (
          // Gallery View - Sadece görseller
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 transition hover:scale-105 hover:border-emerald-300 hover:shadow-md"
              >
                {listing.coverImage ? (
                  <Image
                    src={listing.coverImage}
                    alt={listing.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white" />
                )}
                {/* Type Badge Overlay */}
                <div className="absolute left-1 top-1">
                  <div className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-white shadow ${
                    listing.listingType === 'give' ? 'bg-emerald-600' :
                    listing.listingType === 'swap' ? 'bg-sky-600' :
                    listing.listingType === 'sell' ? 'bg-orange-500' :
                    listing.listingType === 'need' ? 'bg-purple-600' :
                    'bg-cyan-600'
                  }`}>
                    {listing.listingType === 'give' ? 'Free' :
                     listing.listingType === 'swap' ? 'Swap' :
                     listing.listingType === 'sell' ? 'Sale' :
                     listing.listingType === 'need' ? 'Need' :
                     'Adopt'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Grid View - Normal kartlar
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

