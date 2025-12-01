import Link from "next/link";
import Image from "next/image";

import { LANDING_PAGES } from "@/data/homepage";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-900 py-10 text-sm text-zinc-400">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top Section: Brand - Full Width */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/yenilogo.png"
              alt="ReloopCycle Logo"
              width={200}
              height={70}
              className="h-auto w-auto object-contain"
            />
          </div>
          <p className="mb-2 text-sm">Give, Swap, Reuse. Join the circular economy movement in the UK.</p>
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} ReloopCycle</p>
        </div>

        {/* Bottom Section: Links in Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Quick Links */}
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Quick Links</p>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="transition hover:text-emerald-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-emerald-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="transition hover:text-emerald-400">
                  Subscription
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-emerald-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="transition hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="transition hover:text-emerald-400">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition hover:text-emerald-400">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover (SEO Landing Pages) */}
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Discover</p>
            <ul className="space-y-2">
              {LANDING_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="transition hover:text-emerald-400">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="mx-auto mt-12 max-w-6xl border-t border-zinc-800 px-6 pt-8">
        <h3 className="mb-6 text-center text-lg font-semibold text-white">Our Services</h3>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h4 className="mb-2 font-semibold text-white">Marketplace Platform</h4>
            <p className="mb-3 text-xs text-zinc-400">
              Connect with neighbors to give, swap, and sell items locally. Reduce waste and build community.
            </p>
            <Link href="/about" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              Learn more →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h4 className="mb-2 font-semibold text-white">Credit System</h4>
            <p className="mb-3 text-xs text-zinc-400">
              Purchase credits to feature listings, boost visibility, and access premium features.
            </p>
            <Link href="/subscription" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              Learn more →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h4 className="mb-2 font-semibold text-white">Subscription Plans</h4>
            <p className="mb-3 text-xs text-zinc-400">
              Unlock unlimited listings, priority support, and advanced analytics with our plans.
            </p>
            <Link href="/subscription" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              Learn more →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h4 className="mb-2 font-semibold text-white">Global Platform</h4>
            <p className="mb-3 text-xs text-zinc-400">
              Available worldwide. Browse local listings and join the circular economy movement.
            </p>
            <Link href="/about" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

