import type { Metadata } from "next";
import Link from "next/link";
import { Recycle, Leaf, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Reuse Items Platform UK | Circular Economy Marketplace",
  description: "Buy, sell, swap, and give away pre-loved items in the UK. Join the circular economy movement and reduce waste with ReloopCycle.",
  keywords: [
    "reuse platform UK",
    "circular economy",
    "pre-loved items",
    "second hand marketplace",
    "sustainable shopping",
    "reduce reuse recycle",
  ],
};

export default function ReusePlatformPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Recycle className="h-4 w-4" />
            Circular Economy
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Reuse Items Platform
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            The UK's leading circular economy marketplace. Buy, sell, swap, and give away pre-loved items. 
            Reduce waste, save money, and join the sustainability movement.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Explore Platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* What is Circular Economy */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            The Circular Economy
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Recycle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Reuse</h3>
              <p className="text-sm text-zinc-600">
                Give items a second, third, or fourth life. Keep products in use for as long as possible.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Leaf className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Reduce</h3>
              <p className="text-sm text-zinc-600">
                Minimize waste and consumption. Buy what you need, reuse what you have.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                <ArrowRight className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Regenerate</h3>
              <p className="text-sm text-zinc-600">
                Return materials to the system. Create a sustainable loop of consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            Platform Features
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Free & Paid Listings</h3>
              <p className="text-sm text-zinc-600">
                Post items for free, swap, or sale. Complete flexibility for all types of transactions.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Local & National</h3>
              <p className="text-sm text-zinc-600">
                Find items in your local area or browse nationwide. 40+ UK cities covered.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Secure Messaging</h3>
              <p className="text-sm text-zinc-600">
                Built-in messaging system to arrange collection and negotiate trades safely.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Community Driven</h3>
              <p className="text-sm text-zinc-600">
                Join thousands of people committed to reducing waste and sustainable living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Join the UK's Leading Reuse Platform</h2>
            <p>
              ReloopCycle is more than just a marketplace - it's a movement towards sustainable consumption. 
              Our platform makes it easy to find, share, and trade pre-loved items across the United Kingdom.
            </p>
            
            <h3>Why Reuse Matters</h3>
            <p>
              The fashion industry alone is responsible for 10% of global carbon emissions. 
              Electronics contribute to growing e-waste. By choosing to reuse items, you're directly 
              reducing demand for new production and keeping items out of landfill.
            </p>
            
            <h3>Success Stories</h3>
            <p>
              Our community has saved over 1,000 tons of items from landfill. From furniture to electronics, 
              every item reused makes a difference to our planet's future.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

