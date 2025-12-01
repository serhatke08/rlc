import type { Metadata } from "next";
import Link from "next/link";
import { Recycle, Users, Globe, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About ReloopCycle | UK's Circular Economy Marketplace",
  description: "Learn about ReloopCycle - the UK's leading platform for giving, swapping, and reusing items. Join our mission to reduce waste and build sustainable communities.",
  keywords: ["about reloopcycle", "circular economy", "sustainable marketplace", "UK reuse platform"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-6xl">
            About ReloopCycle
          </h1>
          <p className="text-lg text-zinc-600 lg:text-xl">
            We're building the UK's most trusted circular economy marketplace. 
            Give, swap, and reuse items to reduce waste and connect communities.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-3xl font-bold text-zinc-900">Our Story</h2>
          <div className="space-y-4 text-zinc-600">
            <p>
              ReloopCycle was founded on a simple belief: every item deserves a second life. 
              In a world where millions of tonnes of perfectly usable items end up in landfill 
              each year, we saw an opportunity to make a difference.
            </p>
            <p>
              We built a platform that makes it easy for people across the UK to share, swap, 
              and reuse items locally. From furniture to electronics, clothes to books, our 
              marketplace connects neighbors and reduces waste.
            </p>
            <p>
              Today, we're proud to serve over 10,000 active users across 40+ UK cities, 
              helping save over 1,000 tonnes of items from landfill.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">Our Mission</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Recycle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Reduce Waste</h3>
              <p className="text-sm text-zinc-600">
                Keep items out of landfill and reduce environmental impact
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                <Users className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Build Community</h3>
              <p className="text-sm text-zinc-600">
                Connect neighbors and strengthen local relationships
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Globe className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Circular Economy</h3>
              <p className="text-sm text-zinc-600">
                Promote sustainable consumption and production patterns
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <Heart className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Make it Easy</h3>
              <p className="text-sm text-zinc-600">
                Simple, free platform accessible to everyone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">How It Works</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">List Your Item</h3>
              <p className="text-zinc-600">
                Post items you want to give away, swap, or sell. Add photos and descriptions in minutes.
              </p>
            </div>

            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Connect Locally</h3>
              <p className="text-zinc-600">
                Browse items near you or get contacted by interested people in your area.
              </p>
            </div>

            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Complete Exchange</h3>
              <p className="text-zinc-600">
                Arrange collection, make the swap, and give items a new life. It's that simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900">Join the Movement</h2>
          <p className="mb-8 text-lg text-zinc-600">
            Be part of the UK's circular economy revolution. Start sharing, swapping, and reusing today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Get Started Free
            </Link>
            <Link
              href="/"
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 font-semibold text-zinc-900 transition hover:border-zinc-300"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

