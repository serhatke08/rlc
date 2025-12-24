import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Box, Heart, Leaf, Users, ArrowLeftRight, Recycle } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "How to Declutter by Giving Things Away - UK Guide 2024 | ReloopCycle",
  description: "Learn how to declutter your home by giving items away. Step-by-step guide to sorting, organizing, and giving away unwanted items in the UK while helping others.",
  keywords: [
    "how to declutter by giving away",
    "declutter home UK",
    "give away unwanted items",
    "decluttering guide",
    "minimalist living UK",
    "reduce clutter",
    "give away stuff",
  ],
  openGraph: {
    title: "How to Declutter by Giving Things Away - UK Guide",
    description: "Transform your home by giving away unwanted items. Complete guide to decluttering through giving.",
    type: "article",
  },
};

export default async function HowToDeclutterGivingAwayPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch free listings for examples
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
      .or("listing_type.eq.give,price.eq.0")
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
    listingType: "give",
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
      <section className="bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
            <Sparkles className="h-4 w-4" />
            Decluttering Guide
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl">
            How to Declutter by Giving Things Away
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Transform your home by giving away unwanted items. This guide shows you how to declutter 
            effectively while helping others and reducing waste in the UK.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Benefits */}
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Benefits of Decluttering Through Giving</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
                <Box className="mb-3 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Cleaner Home</h3>
                <p className="text-sm text-zinc-600">Free up space and create a more organized, peaceful living environment.</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
                <Heart className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Help Others</h3>
                <p className="text-sm text-zinc-600">Your unwanted items can be exactly what someone else needs.</p>
              </div>
              <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-6">
                <Leaf className="mb-3 h-8 w-8 text-cyan-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Reduce Waste</h3>
                <p className="text-sm text-zinc-600">Keep items out of landfills and support the circular economy.</p>
              </div>
            </div>
          </div>

          {/* The Decluttering Process */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">The Decluttering Process</h2>
            
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">1</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Choose a Room or Category</h3>
                </div>
                <p className="text-zinc-600">
                  Start small - don't try to declutter your entire home at once. Choose one room (like the bedroom 
                  or living room) or one category of items (like books, clothes, or kitchenware). This makes the 
                  process more manageable and less overwhelming.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">2</div>
                  <h3 className="text-xl font-semibold text-zinc-900">The Three-Pile Method</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Sort items into three categories:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span><strong>Keep:</strong> Items you use regularly or truly love</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span><strong>Give Away:</strong> Items in good condition that others could use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400" />
                    <span><strong>Recycle/Bin:</strong> Items that are broken beyond repair or truly unusable</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">3</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Ask the Right Questions</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  For each item, ask yourself:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Have I used this in the last year?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Does this bring me joy or serve a purpose?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Would someone else benefit more from this?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Am I keeping this "just in case"? (Most "just in case" items can go)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">4</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Prepare Items to Give Away</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Before listing, prepare your items:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Clean items thoroughly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Test electronics to ensure they work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Gather any accessories, manuals, or boxes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span>Group similar items together (e.g., all kitchenware)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">5</div>
                  <h3 className="text-xl font-semibold text-zinc-900">List Items for Free</h3>
                </div>
                <p className="text-zinc-600">
                  Create listings for items you want to give away. Take good photos, write clear descriptions, 
                  and be honest about condition. Use platforms like ReloopCycle to reach people in your local 
                  area who need these items.
                </p>
              </div>
            </div>
          </div>

          {/* Room-by-Room Tips */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Room-by-Room Decluttering Tips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-zinc-900">Bedroom</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Clothes you haven't worn in a year</li>
                  <li>• Shoes that don't fit or are rarely worn</li>
                  <li>• Extra bedding and towels</li>
                  <li>• Old electronics and chargers</li>
                  <li>• Books you've read and won't reread</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-zinc-900">Living Room</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Decorative items you no longer love</li>
                  <li>• DVDs and CDs (digital alternatives exist)</li>
                  <li>• Extra cushions and throws</li>
                  <li>• Board games you don't play</li>
                  <li>• Magazines and catalogues</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-zinc-900">Kitchen</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Duplicate kitchen gadgets</li>
                  <li>• Mugs and glasses you don't use</li>
                  <li>• Serving dishes for large gatherings (if you rarely host)</li>
                  <li>• Small appliances you haven't used</li>
                  <li>• Cookbooks you don't reference</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-zinc-900">Storage Areas</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Items in boxes you haven't opened in years</li>
                  <li>• Seasonal items you no longer need</li>
                  <li>• Old luggage and bags</li>
                  <li>• Sports equipment you don't use</li>
                  <li>• Tools and DIY supplies (if you have duplicates)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Maintaining a Decluttered Home */}
          <div className="mb-12 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Maintaining a Decluttered Home</h2>
            <p className="mb-4 text-zinc-600">
              Decluttering is an ongoing process. Here's how to keep your home clutter-free:
            </p>
            <ul className="space-y-3 text-zinc-600">
              <li className="flex items-start gap-3">
                <ArrowLeftRight className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>One in, one out rule:</strong> When you buy something new, commit to giving away something old</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowLeftRight className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Regular reviews:</strong> Every few months, do a quick sweep of each room</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowLeftRight className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Don't let items accumulate:</strong> If something sits unused for 6 months, consider giving it away</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowLeftRight className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Think before buying:</strong> Ask yourself if you really need new items before purchasing</span>
              </li>
            </ul>
          </div>

          {/* Example Listings */}
          {listings.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-zinc-900">Items Others Are Decluttering</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/give-away-items-uk"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  View All Free Items
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">Ready to Start Decluttering?</h2>
            <p className="mb-6 text-zinc-600">
              Give your unwanted items a second life while creating a cleaner, more organized home. 
              Start listing items for free on ReloopCycle today.
            </p>
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700"
            >
              List Your Items for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

