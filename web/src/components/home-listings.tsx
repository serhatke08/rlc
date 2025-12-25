'use client';

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { ListingFilterPills } from "@/components/listings/filter-pills";
import { ListingCard } from "@/components/listing-card";
import { CategoriesMenu } from "@/components/categories-menu";
import { LocationMenu } from "@/components/location-menu";
import { InArticleAd, DisplayAdCard } from "@/components/ads/google-adsense";
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
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <Leaf className="h-4 w-4" />
                UK's Circular Economy Marketplace
              </div>
              
              <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl xl:text-6xl">
                Give, Swap, Reuse
              </h1>
              
              <p className="mb-6 text-lg text-zinc-600 lg:text-xl">
                Join thousands of people across the UK who are giving items a second life. 
                Connect with your community, reduce waste, and build a more sustainable future.
              </p>

              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  href="/create-listing"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  List Your Item
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/give-away-items-uk"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
                >
                  Browse Free Items
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 lg:text-3xl">18.4K+</div>
                  <div className="text-sm text-zinc-600">Active Listings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 lg:text-3xl">3.1K</div>
                  <div className="text-sm text-zinc-600">Tons Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 lg:text-3xl">220K</div>
                  <div className="text-sm text-zinc-600">Members</div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
                <Image
                  src="/images/Reloopcycle.png"
                  alt="ReloopCycle - Circular Economy Marketplace"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
          // Gallery View - Images only
          // For non-authenticated users: 3 items + 1 ad (4th card)
          <div className={`grid gap-2 ${
            !isAuthenticated 
              ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-4' 
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4'
          }`}>
            {!isAuthenticated ? (
              // Non-authenticated users: 3 products + 1 ad (4th card)
              <>
                {filteredListings.slice(0, 3).map((listing, index) => (
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
                <DisplayAdCard />
              </>
            ) : (
              // Authenticated users: all products
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
        ) : (
          // Grid View - Normal cards
          // For non-authenticated users: 3 items + 1 ad (4th card)
          // PC view: 2 cards per row (grid-cols-2)
          <div className={`grid gap-4 ${
            !isAuthenticated 
              ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2'
          }`}>
            {!isAuthenticated ? (
              // Non-authenticated users: 3 products + 1 ad (4th card)
              <>
                {filteredListings.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
                <DisplayAdCard />
              </>
            ) : (
              // Authenticated users: all products
              filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
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
  );
}

