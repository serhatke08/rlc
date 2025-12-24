import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowRight, CheckCircle2, Truck, AlertTriangle, Users, Home } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import type { FeaturedListing } from "@/types/listing";

export const metadata: Metadata = {
  title: "How to Give Away Large Items - Furniture & Appliances UK Guide | ReloopCycle",
  description: "Complete guide on giving away large items like furniture, appliances, and bulky goods in the UK. Learn how to move, photograph, and list heavy items for free collection.",
  keywords: [
    "how to give away large items",
    "give away furniture UK",
    "give away appliances",
    "large furniture giveaway",
    "bulky items free",
    "furniture collection UK",
    "appliances for free",
  ],
  openGraph: {
    title: "How to Give Away Large Items - Furniture & Appliances UK Guide",
    description: "Expert tips on giving away furniture, appliances, and other large items. Learn about moving, photography, and collection arrangements.",
    type: "article",
  },
};

export default async function HowToGiveAwayLargeItemsPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch furniture and large item listings
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

  // Filter for furniture/large items keywords
  const largeItemKeywords = ['sofa', 'table', 'wardrobe', 'cabinet', 'bed', 'fridge', 'freezer', 'washing machine', 'dishwasher', 'cooker', 'oven', 'furniture', 'appliance'];
  const largeItemListings = listingsData.filter((listing: any) => 
    largeItemKeywords.some(keyword => 
      listing.title?.toLowerCase().includes(keyword) || 
      listing.description?.toLowerCase().includes(keyword) ||
      listing.category?.name?.toLowerCase().includes(keyword)
    )
  ).slice(0, 9);

  const listings: FeaturedListing[] = largeItemListings.map((listing: any) => ({
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
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50 px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            <Package className="h-4 w-4" />
            Large Items Guide
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 lg:text-5xl">
            How to Give Away Large Items
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Giving away furniture, appliances, and other bulky items requires special consideration. 
            Learn how to safely move, photograph, and arrange collection for large items in the UK.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Types of Large Items */}
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Common Large Items People Give Away</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Home className="mb-3 h-6 w-6 text-amber-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Furniture</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Sofas and armchairs</li>
                  <li>• Tables (dining, coffee, side)</li>
                  <li>• Wardrobes and chests of drawers</li>
                  <li>• Beds and mattresses</li>
                  <li>• Bookcases and shelving</li>
                  <li>• Cabinets and sideboards</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <Package className="mb-3 h-6 w-6 text-amber-600" />
                <h3 className="mb-2 font-semibold text-zinc-900">Appliances</h3>
                <ul className="space-y-1 text-sm text-zinc-600">
                  <li>• Refrigerators and freezers</li>
                  <li>• Washing machines and dryers</li>
                  <li>• Dishwashers</li>
                  <li>• Ovens and cookers</li>
                  <li>• Microwaves</li>
                  <li>• TVs (especially large screens)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-900">Step-by-Step Guide for Large Items</h2>
            
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">1</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Prepare the Item</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Clean the item thoroughly. For appliances, ensure they're disconnected and safe. 
                  Note any damage, wear, or issues clearly. Take measurements (length, width, height) 
                  and note the weight if possible - this helps people determine if they can transport it.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">2</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Photograph Well</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Large items need multiple angles. Include:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Full front view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Side views</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Close-ups of any damage or wear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Size reference (person or common object nearby)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">3</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Write a Detailed Description</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  Include all relevant information:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Dimensions (L x W x H in cm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Weight (if known)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Age and brand (if relevant)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Condition and any flaws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Whether it needs disassembly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Floor/room location (ground floor, upstairs, etc.)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">4</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Arrange Collection</h3>
                </div>
                <p className="mb-3 text-zinc-600">
                  For large items, collection arrangements are crucial:
                </p>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span><strong>Specify if you can help load:</strong> Many people appreciate help getting items into a van</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span><strong>Access details:</strong> Mention stairs, narrow doorways, or parking restrictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span><strong>Safety:</strong> Have someone with you if possible when showing/loading items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span><strong>Time windows:</strong> Be clear about when collection is possible (weekends, evenings, etc.)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <h3 className="text-xl font-semibold text-zinc-900">Safety Tips</h3>
                </div>
                <ul className="space-y-2 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Don't move heavy items alone - wait for the recipient to arrive with help</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>For appliances, ensure they're safely disconnected before collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Have someone present during collection for safety</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span>Use proper lifting techniques if helping load</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Disassembly Tips */}
          <div className="mb-12 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">Disassembly Tips</h2>
            <p className="mb-4 text-zinc-600">
              Many large items can be disassembled to make transport easier. This can make your item 
              much more attractive to recipients who don't have large vehicles.
            </p>
            <ul className="space-y-3 text-zinc-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <span><strong>IKEA furniture:</strong> Usually comes apart easily - mention if you have assembly instructions</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <span><strong>Dining tables:</strong> Often removable legs make transport easier</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <span><strong>Wardrobes:</strong> Many come apart into panels - mention if tools are needed</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <span><strong>Bed frames:</strong> Usually can be taken apart</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <span><strong>If you can't disassemble:</strong> Be honest - some people may still be able to collect</span>
              </li>
            </ul>
          </div>

          {/* Example Listings */}
          {listings.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-zinc-900">Large Items Available Now</h2>
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
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">Have Large Items to Give Away?</h2>
            <p className="mb-6 text-zinc-600">
              List your furniture, appliances, or other large items on ReloopCycle and help them find a new home.
            </p>
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700"
            >
              List Your Large Item for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

