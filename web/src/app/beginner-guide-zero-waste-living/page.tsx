import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, ArrowRight, CheckCircle2, Recycle, Sprout, Heart, Users, Package, ShoppingBag } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "Beginner's Guide to Zero Waste Living - UK Guide 2024 | ReloopCycle",
  description: "Complete beginner's guide to zero waste living in the UK. Learn how to reduce waste, reuse items, and live more sustainably. Practical tips and advice for starting your zero waste journey.",
  keywords: [
    "beginner guide zero waste",
    "zero waste living UK",
    "how to reduce waste",
    "sustainable living guide",
    "zero waste beginner",
    "reduce waste UK",
    "circular economy",
    "sustainable lifestyle",
  ],
  openGraph: {
    title: "Beginner's Guide to Zero Waste Living - UK Guide",
    description: "Start your zero waste journey with this comprehensive beginner's guide. Practical tips for reducing waste and living sustainably.",
    type: "article",
  },
};

export default async function BeginnerGuideZeroWastePage() {
  const supabase = await createSupabaseServerClient();

  // Fetch free and swap listings for examples
  let listingsData: any[] = [];
  try {
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
        created_at,
        view_count,
        comment_count,
        listing_type,
        country:countries(name, code),
        region:regions(name),
        city:cities(name),
        category:product_categories(name),
        seller:profiles(id, username, display_name, avatar_url)
      `)
      .eq("status", "active")
      .in("listing_type", ["give", "swap"])
      .order("created_at", { ascending: false })
      .limit(12);
    
    listingsData = (data || []) as any[];
  } catch (error) {
    console.error("Error fetching listings:", error);
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
    listingType: listing.listing_type === "swap" ? "swap" : "give",
    coverImage: listing.thumbnail_url || listing.images?.[0],
    seller: listing.seller ? {
      id: listing.seller.id,
      username: listing.seller.username,
      display_name: listing.seller.display_name,
      avatar_url: listing.seller.avatar_url,
    } : undefined,
    tags: [],
    createdAt: listing.created_at,
    views: listing.view_count || 0,
    comments: listing.comment_count || 0,
    favorites: listing.favorite_count || 0,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <Leaf className="h-4 w-4" />
            Beginner's Guide
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl">
            Beginner's Guide to Zero Waste Living
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Starting your zero waste journey? This comprehensive guide will help you reduce waste, 
            live more sustainably, and join the circular economy movement in the UK.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* What is Zero Waste */}
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">What is Zero Waste Living?</h2>
            <p className="mb-4 text-lg text-zinc-600">
              Zero waste living is about minimizing the amount of waste you send to landfill. It's not about 
              producing absolutely zero waste (which is nearly impossible), but about making conscious choices 
              to reduce, reuse, and recycle as much as possible.
            </p>
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
              <h3 className="mb-3 font-semibold text-zinc-900">The 5 R's of Zero Waste</h3>
              <ol className="space-y-2 text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">1. Refuse</span>
                  <span>Say no to things you don't need (single-use plastics, free samples, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">2. Reduce</span>
                  <span>Buy less and choose quality items that last longer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">3. Reuse</span>
                  <span>Use items multiple times, repair instead of replace, buy second-hand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">4. Recycle</span>
                  <span>Properly recycle items that can't be reused</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">5. Rot</span>
                  <span>Compost organic waste to return nutrients to the earth</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Getting Started: Easy First Steps</h2>
            
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">1</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Start with One Area</h3>
                </div>
                <p className="text-zinc-600">
                  Don't try to change everything at once. Pick one area to focus on first - like the kitchen, 
                  bathroom, or shopping habits. Master that area, then move to the next. This makes the 
                  transition more manageable and sustainable.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">2</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Use What You Already Have</h3>
                </div>
                <p className="text-zinc-600">
                  Before buying "zero waste" alternatives, use up what you already own. There's no point in 
                  throwing away perfectly good items to replace them with "eco-friendly" versions. The most 
                  sustainable item is the one you already have.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">3</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Buy Second-Hand First</h3>
                </p>
                <p className="text-zinc-600">
                  When you do need something new, check second-hand options first. Platforms like ReloopCycle 
                  are perfect for finding quality items that others no longer need. This extends the life of 
                  products and reduces demand for new manufacturing.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">4</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Refuse Single-Use Items</h3>
                </div>
                <p className="text-zinc-600">
                  Start refusing single-use items like plastic bags, disposable coffee cups, and straws. 
                  Keep reusable alternatives handy - a tote bag, coffee cup, and water bottle are great 
                  starting points.
                </p>
              </div>
            </div>
          </div>

          {/* Zero Waste Swaps */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Easy Zero Waste Swaps</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <ShoppingBag className="mb-3 h-6 w-6 text-green-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Shopping Bags</h3>
                <p className="text-sm text-zinc-600">
                  <strong>Instead of:</strong> Plastic bags<br />
                  <strong>Use:</strong> Reusable tote bags or baskets
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-green-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Food Storage</h3>
                <p className="text-sm text-zinc-600">
                  <strong>Instead of:</strong> Plastic wrap and bags<br />
                  <strong>Use:</strong> Beeswax wraps, glass containers, or silicone bags
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-green-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Water Bottles</h3>
                <p className="text-sm text-zinc-600">
                  <strong>Instead of:</strong> Single-use plastic bottles<br />
                  <strong>Use:</strong> Reusable water bottle (stainless steel or glass)
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-green-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Clothing</h3>
                <p className="text-sm text-zinc-600">
                  <strong>Instead of:</strong> Fast fashion<br />
                  <strong>Use:</strong> Second-hand clothing, clothes swaps, quality pieces that last
                </p>
              </div>
            </div>
          </div>

          {/* The Circular Economy */}
          <div className="mb-12 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Join the Circular Economy</h2>
            <p className="mb-4 text-zinc-600">
              The circular economy is about keeping products and materials in use for as long as possible. 
              Instead of the traditional "take, make, dispose" model, we aim to create a closed loop where 
              items are reused, repaired, and recycled.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <Recycle className="mb-2 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Give Away</h3>
                <p className="text-sm text-zinc-600">Give items you no longer need to others who can use them</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <Sprout className="mb-2 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Swap</h3>
                <p className="text-sm text-zinc-600">Exchange items with others instead of buying new</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <Heart className="mb-2 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Buy Used</h3>
                <p className="text-sm text-zinc-600">Purchase second-hand items to extend their lifecycle</p>
              </div>
            </div>
          </div>

          {/* Tips for Success */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Tips for Zero Waste Success</h2>
            <ul className="space-y-3 text-zinc-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <span><strong>Be patient with yourself:</strong> Zero waste is a journey, not a destination. Every small step counts.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <span><strong>Focus on progress, not perfection:</strong> Don't feel guilty about occasional slip-ups.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <span><strong>Connect with others:</strong> Join local zero waste groups or online communities for support and ideas.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <span><strong>Learn about your local recycling:</strong> Different UK councils have different rules - know what can be recycled in your area.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <span><strong>Support circular economy platforms:</strong> Use platforms like ReloopCycle to give and receive items within your community.</span>
              </li>
            </ul>
          </div>

          {/* Example Listings */}
          {listings.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-zinc-900">Join the Circular Economy Now</h2>
              <p className="mb-4 text-zinc-600">
                Start your zero waste journey by browsing items available for free or swap in your area:
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/zero-waste-community-uk"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  View All Zero Waste Listings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">Ready to Start Your Zero Waste Journey?</h2>
            <p className="mb-6 text-zinc-600">
              Join the circular economy movement. Give away items you no longer need, find second-hand treasures, 
              and help build a more sustainable future in the UK.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/create-listing"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700"
              >
                Give Away Items
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/zero-waste-community-uk"
                className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-8 py-4 text-lg font-semibold text-emerald-600 transition hover:bg-emerald-50"
              >
                Browse Free Items
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

