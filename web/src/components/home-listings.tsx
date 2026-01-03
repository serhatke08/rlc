'use client';

import { useState, useMemo, Suspense, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ListingFilterPills } from "@/components/listings/filter-pills";
import { ListingCard } from "@/components/listing-card";
import { CategoriesMenu } from "@/components/categories-menu";
import { LocationMenu } from "@/components/location-menu";
import { InArticleAd } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";
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
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(5); // PC'de başlangıçta 5x5
  
  // Mobile columns (only 2 or 3)
  const [mobileColumns, setMobileColumns] = useState<2 | 3>(2); // Mobilde başlangıçta 2x2
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setColumnsDropdownOpen(false);
      }
    };

    if (columnsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [columnsDropdownOpen]);

  // Grid columns classes - all must be present for Tailwind JIT to detect them

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
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium transition md:px-3 md:py-1.5 md:text-sm ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium transition md:px-3 md:py-1.5 md:text-sm ${
                viewMode === 'gallery'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Gallery
            </button>
            {/* Grid Columns Dropdown - Show in both grid and gallery view */}
            <div className="relative" ref={columnsDropdownRef}>
              <button
                onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 md:gap-1.5 md:px-2.5 md:py-1 md:text-xs"
              >
                <span className="md:hidden">{mobileColumns}×{mobileColumns}</span>
                <span className="hidden md:inline">{gridColumns}×{gridColumns}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform md:h-3.5 md:w-3.5", columnsDropdownOpen && "rotate-180")} />
              </button>
              {columnsDropdownOpen && (
                <>
                  {/* Mobile dropdown - only 2x2 and 3x3 */}
                  <div className="absolute right-0 top-full z-50 mt-1 w-20 rounded-lg border border-zinc-200 bg-white shadow-lg md:hidden">
                    <div className="py-1">
                      {[2, 3].map((cols) => (
                        <button
                          key={cols}
                          onClick={() => {
                            setMobileColumns(cols as 2 | 3);
                            setColumnsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-[10px] font-medium transition",
                            mobileColumns === cols
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-zinc-700 hover:bg-zinc-50"
                          )}
                        >
                          {cols}×{cols}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Desktop dropdown - 2, 3, 4, 5 */}
                  <div className="absolute right-0 top-full z-50 mt-1 hidden w-20 rounded-lg border border-zinc-200 bg-white shadow-lg md:block">
                    <div className="py-1">
                      {[2, 3, 4, 5].map((cols) => (
                        <button
                          key={cols}
                          onClick={() => {
                            setGridColumns(cols as 2 | 3 | 4 | 5);
                            setColumnsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-xs font-medium transition",
                            gridColumns === cols
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-zinc-700 hover:bg-zinc-50"
                          )}
                        >
                          {cols}×{cols}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
                <div className={cn(
                  "grid gap-2",
                  !isAuthenticated 
                    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-5' 
                    : cn(
                        mobileColumns === 2 && 'grid-cols-2',
                        mobileColumns === 3 && 'grid-cols-3',
                        gridColumns === 2 && 'md:grid-cols-2',
                        gridColumns === 3 && 'md:grid-cols-3',
                        gridColumns === 4 && 'md:grid-cols-4',
                        gridColumns === 5 && 'md:grid-cols-5'
                      )
                )}>
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
                    PC view: Dynamic columns based on user selection */}
                <div className={cn(
                  "grid gap-4",
                  !isAuthenticated 
                    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-5' 
                    : cn(
                        mobileColumns === 2 && 'grid-cols-2',
                        mobileColumns === 3 && 'grid-cols-3',
                        gridColumns === 2 && 'md:grid-cols-2',
                        gridColumns === 3 && 'md:grid-cols-3',
                        gridColumns === 4 && 'md:grid-cols-4',
                        gridColumns === 5 && 'md:grid-cols-5'
                      )
                )}>
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

