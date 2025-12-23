import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Search, TrendingUp } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "Trade Websites UK Free | Free Trading Platform | ReloopCycle",
  description: "Discover the best free trade websites in the UK. Trade, swap, and exchange items for free. Find free electronics, furniture, and more on ReloopCycle's free trading platform.",
  keywords: [
    "trade websites uk free",
    "free electronics near me",
    "free reuse marketplace",
    "freecycle near me",
    "freecycling near me",
    "reuse cycle",
    "freecycle furniture near me",
    "free trading platform",
    "free swap website",
    "circular economy UK",
  ],
  openGraph: {
    title: "Trade Websites UK Free | ReloopCycle",
    description: "Join the UK's best free trading platform. Trade, swap, and reuse items for free.",
    type: "website",
  },
};

export default async function TradeWebsitesUKFreePage() {
  let listingsData: any[] = [];

  try {
    const supabase = await createSupabaseServerClient();

    // Fetch free listings
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        description,
        price,
        condition,
        images,
        thumbnail_url,
        metadata,
        created_at,
        view_count,
        comment_count,
        listing_type,
        country:countries(name, code, flag_emoji),
        region:regions(name, code),
        city:cities(name, is_major),
        category:product_categories(name)
      `)
      .eq("status", "active")
      .or("listing_type.eq.free,price.eq.0,listing_type.eq.swap")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      console.error("Error fetching listings:", error);
    } else {
      listingsData = (data || []) as any[];
    }
  } catch (error) {
    // Handle auth errors gracefully - this is a public page
    console.error("Error initializing Supabase client:", error);
    listingsData = [];
  }
  const listings: FeaturedListing[] = listingsData.map((listing: any) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    city: listing.city?.name || "UK",
    region: listing.region?.name,
    country: listing.country?.name,
    category: listing.category?.name || "General",
    condition: listing.condition as any,
    status: "available",
    listingType: listing.listing_type || "give",
    coverImage: listing.thumbnail_url || listing.images?.[0],
    tags: [],
    createdAt: listing.created_at,
    views: listing.view_count || 0,
    comments: listing.comment_count || 0,
    favorites: listing.favorite_count || 0,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <ShoppingBag className="h-4 w-4" />
            Free Trading Platform
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Trade Websites UK Free
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Discover the best free trade websites in the UK. Trade, swap, and exchange items 
            for free on ReloopCycle. Find free electronics, furniture, and more without spending a penny.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Free Items
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Start Trading Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{listings.length}+</p>
              <p className="mt-2 text-sm text-zinc-600">Free Items Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">100%</p>
              <p className="mt-2 text-sm text-zinc-600">Free Forever</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">40+</p>
              <p className="mt-2 text-sm text-zinc-600">UK Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">
            Latest Free Trade Items
          </h2>
          
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400" />
              <p className="mt-4 text-sm text-zinc-600">
                No free items available right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            How Free Trading Works
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Search & Browse</h3>
              <p className="text-sm text-zinc-600">
                Search for free items or browse by category. Find exactly what you need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Contact & Trade</h3>
              <p className="text-sm text-zinc-600">
                Message the owner to arrange pickup or swap. Everything is free!
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Join the Movement</h3>
              <p className="text-sm text-zinc-600">
                Be part of the circular economy. Reduce waste and save money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Best Free Trade Websites in the UK</h2>
            <p>
              ReloopCycle is one of the leading free trade websites in the UK, offering a platform 
              where you can trade, swap, and exchange items completely free of charge. Whether you're 
              looking for free electronics near me, freecycle furniture, or a free reuse marketplace, 
              we connect you with people in your local area.
            </p>
            
            <h3>Why Choose Free Trade Websites?</h3>
            <ul>
              <li><strong>Completely Free:</strong> No fees, no subscriptions, no hidden costs</li>
              <li><strong>Local Connections:</strong> Find items and people in your area</li>
              <li><strong>Reduce Waste:</strong> Give items a second life instead of throwing them away</li>
              <li><strong>Save Money:</strong> Get quality items without spending a penny</li>
              <li><strong>Community Building:</strong> Connect with neighbors and build relationships</li>
            </ul>
            
            <h3>Popular Free Trade Searches</h3>
            <p>
              Our users frequently search for:
            </p>
            <ul>
              <li><strong>Free electronics near me:</strong> Find free TVs, laptops, phones, and more</li>
              <li><strong>Freecycle near me:</strong> Discover local freecycle groups and items</li>
              <li><strong>Free reuse marketplace:</strong> Browse items available for reuse</li>
              <li><strong>Freecycle furniture near me:</strong> Find free sofas, tables, chairs, and more</li>
              <li><strong>Reuse cycle:</strong> Join the circular economy movement</li>
            </ul>
            
            <h3>How It Differs from Other Trade Websites</h3>
            <p>
              Unlike other trade websites that charge fees or require subscriptions, ReloopCycle is 
              completely free. You can list items, browse listings, and connect with other users without 
              any cost. Our platform focuses on the circular economy, helping reduce waste while 
              connecting communities across the UK.
            </p>
            
            <h3>Major UK Cities</h3>
            <p>
              Find free trade items in London, Manchester, Birmingham, Liverpool, Leeds, Edinburgh, 
              Glasgow, Bristol, and over 40 other UK cities. Our platform spans the entire United Kingdom, 
              making it easy to find items near you.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

