import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Gift, ArrowRight, CheckCircle2, Globe, Users, Leaf, Recycle } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "How to Give Away Items Without Using Facebook - UK Guide 2024 | ReloopCycle",
  description: "Discover the best platforms to give away items for free in the UK without Facebook. Learn about privacy-focused alternatives like ReloopCycle, Freecycle, and more.",
  keywords: [
    "how to give away without facebook",
    "give away items no facebook",
    "free stuff without facebook",
    "privacy-friendly giveaway",
    "alternatives to facebook marketplace",
    "give away items UK",
    "circular economy platforms",
  ],
  openGraph: {
    title: "How to Give Away Items Without Using Facebook - UK Guide",
    description: "Privacy-friendly alternatives to Facebook for giving away free items. Discover platforms that respect your privacy.",
    type: "article",
  },
};

export default async function HowToGiveAwayWithoutFacebookPage() {
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
      .limit(9);
    
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
      <section className="bg-gradient-to-br from-sky-50 via-white to-sky-50 px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            <Shield className="h-4 w-4" />
            Privacy-Focused
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl">
            How to Give Away Items Without Using Facebook
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Want to give away your items for free but prefer not to use Facebook? Discover privacy-friendly 
            alternatives that help you donate items while protecting your personal information.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Why Avoid Facebook */}
          <div className="mb-12 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-8">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Why Look for Alternatives?</h2>
            <div className="space-y-4 text-zinc-700">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-6 w-6 flex-shrink-0 text-sky-600" />
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900">Privacy Concerns</h3>
                  <p className="text-sm">Facebook requires access to your personal data, friends list, and more. Alternative platforms offer better privacy protection.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-6 w-6 flex-shrink-0 text-sky-600" />
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900">No Account Required</h3>
                  <p className="text-sm">Many platforms don't require you to create a Facebook account or link your social media profiles.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-6 w-6 flex-shrink-0 text-sky-600" />
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900">Focused Communities</h3>
                  <p className="text-sm">Specialized platforms often have more engaged communities focused specifically on reuse and giving.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Best Alternatives */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Best Alternatives to Facebook</h2>
            
            <div className="space-y-6">
              {/* ReloopCycle */}
              <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-600 p-2">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">ReloopCycle</h3>
                    <p className="text-sm text-zinc-600">Circular economy marketplace focused on reuse</p>
                  </div>
                </div>
                <ul className="mb-4 space-y-2 text-zinc-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>No Facebook account required - create a standalone account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>Privacy-focused - minimal data collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>Free listings - no fees for giving items away</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>UK-wide coverage with location-based listings</span>
                  </li>
                </ul>
                <Link
                  href="/create-listing"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  List on ReloopCycle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Freecycle */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600 p-2">
                    <Recycle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">Freecycle</h3>
                    <p className="text-sm text-zinc-600">Local community groups via email or website</p>
                  </div>
                </div>
                <ul className="mb-4 space-y-2 text-zinc-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span>Completely independent from Facebook</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span>Email-based groups in your local area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span>Very active communities in most UK cities</span>
                  </li>
                </ul>
              </div>

              {/* Gumtree */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-amber-600 p-2">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">Gumtree Freebies</h3>
                    <p className="text-sm text-zinc-600">Popular UK classifieds with free section</p>
                  </div>
                </div>
                <ul className="space-y-2 text-zinc-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>No Facebook login required - standalone account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Wide reach across the UK</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Easy to post free items</span>
                  </li>
                </ul>
              </div>

              {/* Olio */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-green-600 p-2">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">Olio</h3>
                    <p className="text-sm text-zinc-600">Food and household items sharing app</p>
                  </div>
                </div>
                <ul className="space-y-2 text-zinc-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Mobile app - no Facebook required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Great for food waste and small items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Hyperlocal - very nearby neighbours</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-12 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="bg-zinc-50 px-6 py-4">
              <h2 className="text-2xl font-bold text-zinc-900">Quick Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Platform</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">No Facebook Required</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Free to Use</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900">ReloopCycle</td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">Furniture, electronics, all items</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900">Freecycle</td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">Local community items</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900">Gumtree</td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">All items, wide reach</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900">Olio</td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <CheckCircle2 className="inline h-5 w-5 text-emerald-600" />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">Food, small items</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Listings */}
          {listings.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-zinc-900">Items Available on ReloopCycle</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">Ready to Give Away Items Privately?</h2>
            <p className="mb-6 text-zinc-600">
              Join ReloopCycle - a privacy-focused platform that doesn't require Facebook or share your personal data.
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

