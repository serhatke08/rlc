import type { Metadata } from "next";
import Link from "next/link";
import { Gift, ArrowRight, CheckCircle2, Package, Heart, Users, Leaf } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "How to Give Away Stuff for Free - Complete Guide UK 2024 | ReloopCycle",
  description: "Complete guide on how to give away items for free in the UK. Learn the best ways to donate furniture, electronics, clothes, and more. Join the circular economy and help reduce waste.",
  keywords: [
    "how to give away stuff for free",
    "how to give away free stuff",
    "give away items UK",
    "free giveaway guide",
    "donate items UK",
    "circular economy UK",
    "reduce waste UK",
  ],
  openGraph: {
    title: "How to Give Away Stuff for Free - Complete Guide UK",
    description: "Learn the best ways to give away your unwanted items for free. Complete guide with tips, platforms, and best practices.",
    type: "article",
  },
};

export default async function HowToGiveAwayFreePage() {
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
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Gift className="h-4 w-4" />
            Complete Guide
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl">
            How to Give Away Stuff for Free in the UK
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Learn the best ways to give away your unwanted items for free. This comprehensive guide covers everything you need to know about donating furniture, electronics, clothes, and more in the UK.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Why Give Away Items */}
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Why Give Away Items for Free?</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
                <Leaf className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Reduce Waste</h3>
                <p className="text-sm text-zinc-600">Help keep items out of landfills and reduce your environmental impact.</p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-6">
                <Heart className="mb-3 h-8 w-8 text-sky-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Help Others</h3>
                <p className="text-sm text-zinc-600">Support people in your community who need affordable items.</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
                <Users className="mb-3 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Build Community</h3>
                <p className="text-sm text-zinc-600">Connect with neighbours and strengthen local connections.</p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Step-by-Step Guide</h2>
            
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">1</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Sort and Clean Your Items</h3>
                </div>
                <p className="text-zinc-600">
                  Go through your items and decide what you want to give away. Clean items thoroughly - 
                  people are more likely to take well-maintained items. Check that everything works properly.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">2</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Take Good Photos</h3>
                </div>
                <p className="text-zinc-600">
                  High-quality photos are essential. Take pictures in good lighting, show any damage or wear 
                  clearly, and include multiple angles. Honest photos build trust with potential recipients.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">3</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Write a Clear Description</h3>
                </div>
                <p className="text-zinc-600">
                  Include the item's condition, size, age, and any relevant details. Be honest about flaws. 
                  Mention if it needs repair or has specific requirements (e.g., "needs assembly").
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">4</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Choose the Right Platform</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Select a platform that fits your needs:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span><strong>ReloopCycle:</strong> Free platform focused on the circular economy, great for furniture and household items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span><strong>Freecycle:</strong> Local community groups, excellent for immediate local pickups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span><strong>Gumtree Freebies:</strong> Popular in the UK, reaches many people quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span><strong>Facebook Marketplace:</strong> Wide reach, easy to use, but requires Facebook account</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">5</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Arrange Collection</h3>
                </div>
                <p className="text-zinc-600">
                  Be clear about when and where the item can be collected. For large items, specify if you can help load. 
                  Consider meeting in a public place or having someone with you for safety. Once someone commits, 
                  mark the item as reserved or remove the listing once collected.
                </p>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-12 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Best Practices</h2>
            <ul className="space-y-3 text-zinc-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Be patient:</strong> It may take time to find the right person for your item</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>First come, first served:</strong> Usually fair, but use your judgment</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Safety first:</strong> Meet in public or have someone with you</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Update your listing:</strong> Remove or mark as taken once collected</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <span><strong>Be respectful:</strong> Respond to messages promptly and politely</span>
              </li>
            </ul>
          </div>

          {/* Items That Are Great to Give Away */}
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Items That Are Great to Give Away</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Furniture</h3>
                <p className="text-sm text-zinc-600">Sofas, tables, chairs, wardrobes, and bookcases are always in demand.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Electronics</h3>
                <p className="text-sm text-zinc-600">Working TVs, computers, kitchen appliances, and smartphones help others save money.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Clothing</h3>
                <p className="text-sm text-zinc-600">Especially children's clothes, winter coats, and professional wear.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Baby & Kids Items</h3>
                <p className="text-sm text-zinc-600">Prams, cots, toys, and children's furniture are highly sought after.</p>
              </div>
            </div>
          </div>

          {/* Example Listings */}
          {listings.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-zinc-900">Free Items Available Now</h2>
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
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">Ready to Give Away Your Items?</h2>
            <p className="mb-6 text-zinc-600">
              Join thousands of people across the UK who are giving items a second life and helping build a more sustainable future.
            </p>
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700"
            >
              List Your Item for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

