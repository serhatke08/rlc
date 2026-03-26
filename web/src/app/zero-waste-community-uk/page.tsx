import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Users, Sprout, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Zero Waste Community UK | Sustainable Living Platform",
  description: "ReloopCycle is built for the community: give away for free, swap, and even sell pre-loved items. You can also post rehoming/adoption listings to help pets find new homes.",
  keywords: [
    "zero waste UK",
    "zero waste community",
    "sustainable living",
    "eco-friendly",
    "waste reduction",
    "environmental community",
  ],
};

export default function ZeroWastePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <Sprout className="h-4 w-4" />
            Zero Waste Movement
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            Zero Waste Community UK
          </h1>
          
          <p className="mb-8 text-lg text-zinc-600 lg:text-xl">
            Join thousands of people committed to reducing waste across the UK. Share items, 
            swap goods, and build a sustainable future together.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Join Community
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            Our Impact
          </h2>
          
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-900">10K+</p>
              <p className="mt-2 text-sm text-zinc-600">Active Members</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-900">1K+</p>
              <p className="mt-2 text-sm text-zinc-600">Tons Saved</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Sprout className="h-8 w-8 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-900">50K+</p>
              <p className="mt-2 text-sm text-zinc-600">Items Reused</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                <ArrowRight className="h-8 w-8 text-sky-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-900">40+</p>
              <p className="mt-2 text-sm text-zinc-600">UK Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zero Waste Principles */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            Zero Waste Principles
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Refuse</h3>
              <p className="text-sm text-zinc-600">
                Say no to things you don't need
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Reduce</h3>
              <p className="text-sm text-zinc-600">
                Minimize consumption and waste
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Reuse</h3>
              <p className="text-sm text-zinc-600">
                Give items a second life
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Swap & Share</h3>
              <p className="text-sm text-zinc-600">
                Exchange items and keep them in the community instead of buying new
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Adopt & Rehome</h3>
              <p className="text-sm text-zinc-600">
                Share adoption and rehoming posts to help animals find a safe new home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Movement */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">
              Ready to Make a Difference?
            </h2>
            <p className="mb-6 text-lg text-zinc-600">
              Join our community of conscious consumers working towards a zero waste future.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <article className="prose prose-zinc max-w-none">
            <h2>Join the UK’s Reuse & Rehoming Community</h2>
            <p>
              ReloopCycle is a community built for people who want to reuse and help others. You can give items away for free,
              swap with neighbors, or sell pre-loved items. And you can also share rehoming/adoption listings to help pets
              find a new home.
            </p>
            
            <h3>What We Do</h3>
            <p>
              Our goal is simple: keep items in circulation for as long as possible. When you reuse instead of discarding,
              you reduce the demand for new production and strengthen your local community.
            </p>
            
            <h3>How We Help</h3>
            <ul>
              <li>Give away for free, swap, or sell pre-loved items locally</li>
              <li>Community support to help you reuse with confidence</li>
              <li>Safer local handovers and clear listing details</li>
              <li>Rehoming & adoption posts for pets</li>
            </ul>
            
            <h3>Why It Matters</h3>
            <p>
              Every item you keep in use helps reduce pressure on the system—and every rehoming post helps animals get
              a second chance.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

