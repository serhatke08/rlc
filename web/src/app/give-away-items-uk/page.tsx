import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Give Away Items UK | Free Stuff Donation Platform",
  description: "Give away your unwanted items for free in the UK. Help others while reducing waste. Post furniture, electronics, clothes, and more on ReloopCycle.",
  keywords: [
    "give away items UK",
    "donate items",
    "free stuff to give away",
    "charity donation",
    "reuse platform",
    "circular economy",
  ],
};

export default function GiveAwayPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-rose-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
            <Heart className="h-4 w-4" />
            Give & Help
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Give Away Items UK
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Got items you no longer need? Give them away for free to someone who needs them. 
            Help reduce waste, support your community, and make someone's day.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
            >
              Post Free Item
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/free-stuff-near-me"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Find Free Items
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            Why Give Away Your Items?
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Gift className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Help Others</h3>
              <p className="text-sm text-zinc-600">
                Your unwanted items could be exactly what someone else needs. Make a difference in your community.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <Heart className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Reduce Waste</h3>
              <p className="text-sm text-zinc-600">
                Keep items out of landfill and reduce your carbon footprint. Every item reused makes a difference.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <ArrowRight className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Declutter Easily</h3>
              <p className="text-sm text-zinc-600">
                Free up space in your home while knowing your items will be appreciated by someone new.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Give Away Your Unwanted Items for Free</h2>
            <p>
              ReloopCycle makes it simple to give away items you no longer need across the UK. 
              Whether it's furniture, electronics, clothes, or household goods, our platform connects 
              you with people who will appreciate and use your items.
            </p>
            
            <h3>What Can You Give Away?</h3>
            <ul>
              <li>Furniture (sofas, beds, tables, chairs)</li>
              <li>Electronics (TVs, laptops, phones)</li>
              <li>Clothing and accessories</li>
              <li>Books, toys, and games</li>
              <li>Kitchen appliances and homeware</li>
              <li>Garden equipment and tools</li>
            </ul>
            
            <h3>It's Completely Free</h3>
            <p>
              There's no cost to post items on ReloopCycle. Simply create a listing, add photos, 
              and wait for interested people to contact you. It's that easy!
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

