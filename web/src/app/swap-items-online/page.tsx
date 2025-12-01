import type { Metadata } from "next";
import Link from "next/link";
import { Repeat2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Swap Items Online UK | Exchange & Trade Platform",
  description: "Swap and trade items online across the UK. Exchange clothes, books, games, and more. Fair trades, zero waste, circular economy.",
  keywords: [
    "swap items online",
    "item exchange UK",
    "trade platform",
    "swap clothes",
    "exchange goods",
    "barter system",
  ],
};

export default function SwapItemsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-sky-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            <Repeat2 className="h-4 w-4" />
            Swap & Trade
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Swap Items Online
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Trade items with people across the UK. Exchange clothes, books, games, electronics, 
            and more. No money needed - just fair swaps!
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              Browse Swap Items
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/create-listing"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Post Swap Item
            </Link>
          </div>
        </div>
      </section>

      {/* How Swapping Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            How Swapping Works
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <span className="text-xl font-bold text-sky-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Post Your Item</h3>
              <p className="text-sm text-zinc-600">
                List what you want to swap and what you're looking for in return.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <span className="text-xl font-bold text-sky-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Find a Match</h3>
              <p className="text-sm text-zinc-600">
                Browse items others want to swap and propose a fair trade.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <span className="text-xl font-bold text-sky-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Make the Swap</h3>
              <p className="text-sm text-zinc-600">
                Arrange to exchange items and enjoy your new finds!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Trade and Exchange Items Online in the UK</h2>
            <p>
              Swapping items is a great way to refresh your belongings without spending money. 
              ReloopCycle connects people across the UK who want to trade items fairly and sustainably.
            </p>
            
            <h3>Popular Items to Swap</h3>
            <ul>
              <li><strong>Clothes & Fashion:</strong> Refresh your wardrobe by swapping clothes</li>
              <li><strong>Books:</strong> Exchange novels, textbooks, and magazines</li>
              <li><strong>Games:</strong> Swap video games, board games, and consoles</li>
              <li><strong>Electronics:</strong> Trade gadgets, phones, and accessories</li>
              <li><strong>Sports Equipment:</strong> Exchange gym gear and outdoor equipment</li>
            </ul>
            
            <h3>Benefits of Swapping</h3>
            <p>
              Swapping reduces consumption, saves money, and keeps items in circulation. 
              It's a win-win for your wallet and the environment.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

