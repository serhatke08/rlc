'use client';

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListingFilterPills } from "@/components/listings/filter-pills";
import { ListingCard } from "@/components/listing-card";
import { CategoriesMenu } from "@/components/categories-menu";
import { LocationMenu } from "@/components/location-menu";
import { InArticleAd } from "@/components/ads/google-adsense";
import type { FeaturedListing } from "@/types/listing";
import type { Category } from "@/lib/types/category";
import type { Country, Region, City } from "@/lib/types/location";

interface HomeListingsProps {
  listings: FeaturedListing[];
  categories?: Category[];
  country?: Country | null;
  regions?: Region[];
  selectedRegion?: Region | null;
  selectedCity?: City | null;
  isAuthenticated?: boolean;
}

export function HomeListings({ listings, categories = [], country = null, regions = [], selectedRegion = null, selectedCity = null, isAuthenticated = false }: HomeListingsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  // Default grid (with descriptions) for non-authenticated users, gallery for authenticated users
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>(isAuthenticated ? 'gallery' : 'grid');

  // Filtered listings (only type - region/city is handled server-side)
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

      return true;
    });
  }, [listings, activeFilter]);

  return (
    <>
      {/* Hero Section - Image as Background */}
      {/* Mobile: Full width, no padding, image fits perfectly */}
      <section className="relative overflow-hidden w-screen ml-[calc(-50vw+50%)] lg:hidden">
        <div className="relative w-full">
          <Image
            src="/images/newapoditon.png"
            alt="ReloopCycle - Circular Economy Marketplace"
            width={0}
            height={0}
            className="w-full h-auto"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
      </section>
      {/* Desktop: Container width */}
      <section className="relative overflow-hidden hidden lg:block mx-auto max-w-6xl aspect-[3/1] min-h-[500px] px-6">
        <Image
          src="/images/newapoditon.png"
          alt="ReloopCycle - Circular Economy Marketplace"
          fill
          className="object-contain object-left"
          priority
          sizes="(max-width: 1024px) 100vw, 1280px"
        />
      </section>

      <div className="pb-12">
      <section className="space-y-4 pt-8">
        <ListingFilterPills 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        {/* Categories Menu */}
        {categories.length > 0 && (
          <Suspense fallback={<div className="h-10" />}>
            <CategoriesMenu categories={categories} />
          </Suspense>
        )}
        {/* Location Menu & View Mode Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Location Menu - left side */}
          {country && (
            <LocationMenu 
              initialCountry={country}
              initialRegions={regions}
              selectedRegion={selectedRegion}
              selectedCity={selectedCity}
            />
          )}
          {/* View Mode Toggle - right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'gallery'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Gallery
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          Latest Listings
          {activeFilter !== "all" && (
            <span className="ml-2 text-base font-normal text-zinc-500">
              ({filteredListings.length} results)
            </span>
          )}
        </h2>
        {filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-sm text-zinc-600">No listings found for these filters.</p>
          </div>
        ) : (
          <>
            {viewMode === 'gallery' ? (
              <>
                {/* Gallery View - Images only
                    For non-authenticated users: 3 items + 1 ad (4th card) */}
                <div className={`grid gap-2 ${
                  !isAuthenticated 
                    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-5' 
                    : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
                }`}>
                  {!isAuthenticated ? (
                    /* Non-authenticated users: all products */
                    <>
                      {filteredListings.map((listing, index) => (
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
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white" />
                        )}
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
                    </>
                  ) : (
                    /* Authenticated users: all products */
                    filteredListings.map((listing) => (
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
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white" />
                        )}
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
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Grid View - Normal cards
                    For non-authenticated users: 3 items + 1 ad (4th card)
                    PC view: 2 cards per row (grid-cols-2) */}
                <div className={`grid gap-4 ${
                  !isAuthenticated 
                    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-5' 
                    : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-5'
                }`}>
                  {!isAuthenticated ? (
                    /* Non-authenticated users: all products */
                    <>
                      {filteredListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </>
                  ) : (
                    /* Authenticated users: all products */
                    filteredListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))
                  )}
                </div>
              </>
            )}
        
            {/* Message for non-authenticated users */}
            {!isAuthenticated && filteredListings.length > 0 && (
              <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 md:p-8 text-center">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-zinc-900">
                  Sign in to see more
                </h3>
                <p className="mb-4 text-sm text-zinc-600">
                  Discover thousands of free items, swaps, and sales by signing in to your account.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </>
        )}
      </section>
      </div>
    </>
  );
}

