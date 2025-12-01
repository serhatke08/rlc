import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Gift, ArrowRight } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "Free Stuff Near Me UK | ReloopCycle",
  description: "Find free stuff near you in the UK. Browse furniture, electronics, clothes, and more. Join the circular economy and give items a second life.",
  keywords: [
    "free stuff near me",
    "free items UK",
    "freecycle",
    "free furniture",
    "free electronics",
    "giveaway items",
    "circular economy",
  ],
  openGraph: {
    title: "Free Stuff Near Me UK | ReloopCycle",
    description: "Discover free items in your local area. Save money and the planet.",
    type: "website",
  },
};

export default async function FreeStuffPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch free listings
  const { data } = await supabase
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
    .or("listing_type.eq.free,price.eq.0")
    .order("created_at", { ascending: false })
    .limit(24);

  const listingsData = (data || []) as any[];
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
    listingType: "give",
    coverImage: listing.thumbnail_url || listing.images?.[0],
    tags: [],
    createdAt: listing.created_at,
    views: listing.view_count || 0,
    comments: listing.comment_count || 0,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Gift className="h-4 w-4" />
            100% Free Items
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Free Stuff Near Me
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Discover free items in your local area across the UK. From furniture to electronics, 
            find quality items that people are giving away for free. Join the circular economy 
            and help reduce waste.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse All Items
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Post Free Item
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{listings.length}+</p>
              <p className="mt-2 text-sm text-zinc-600">Free Items Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">40+</p>
              <p className="mt-2 text-sm text-zinc-600">UK Cities</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">100%</p>
              <p className="mt-2 text-sm text-zinc-600">Free Forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="bg-zinc-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">
            Latest Free Items
          </h2>
          
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <Gift className="mx-auto h-12 w-12 text-zinc-400" />
              <p className="mt-4 text-sm text-zinc-600">
                No free items available right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            How It Works
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Browse Items</h3>
              <p className="text-sm text-zinc-600">
                Search for free items in your area or browse by category.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Contact Owner</h3>
              <p className="text-sm text-zinc-600">
                Message the person giving away the item to arrange collection.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Collect & Enjoy</h3>
              <p className="text-sm text-zinc-600">
                Pick up your free item and give it a new home!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Find Free Stuff Near You in the UK</h2>
            <p>
              ReloopCycle makes it easy to find free items in your local area across the United Kingdom. 
              Whether you're looking for furniture, electronics, clothes, or household items, our platform 
              connects you with people giving away quality items for free.
            </p>
            
            <h3>Why Choose Free Items?</h3>
            <ul>
              <li><strong>Save Money:</strong> Get quality items without spending a penny</li>
              <li><strong>Help the Environment:</strong> Reduce waste and carbon footprint</li>
              <li><strong>Support Your Community:</strong> Connect with local people</li>
              <li><strong>Circular Economy:</strong> Give items a second life instead of landfill</li>
            </ul>
            
            <h3>Popular Free Categories</h3>
            <p>
              Our users commonly find free furniture, electronics, books, toys, garden equipment, 
              and household items. Everything from sofas to smartphones, all completely free.
            </p>
            
            <h3>Major UK Cities</h3>
            <p>
              Find free stuff in London, Manchester, Birmingham, Liverpool, Leeds, Edinburgh, Glasgow, 
              Bristol, and over 40 other UK cities.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

