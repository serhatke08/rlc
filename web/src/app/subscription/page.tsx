import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Subscription Plans | ReloopCycle Premium Features",
  description: "Unlock premium features with ReloopCycle subscriptions. Unlimited listings, priority support, and advanced analytics.",
  keywords: ["reloopcycle subscription", "premium features", "pricing", "plans"],
};

export default function SubscriptionPage() {
  const plans = [
    {
      name: "Free",
      price: "£0",
      period: "forever",
      icon: Check,
      features: [
        "5 active listings",
        "Basic messaging",
        "Community access",
        "Mobile app access",
      ],
    },
    {
      name: "Pro",
      price: "£4.99",
      period: "/month",
      icon: Zap,
      popular: true,
      features: [
        "Unlimited listings",
        "Priority support",
        "Featured listings",
        "Advanced analytics",
        "No advertisements",
      ],
    },
    {
      name: "Business",
      price: "£19.99",
      period: "/month",
      icon: Crown,
      features: [
        "Everything in Pro",
        "Business profile",
        "API access",
        "Custom branding",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-5xl">
            Subscription Plans
          </h1>
          <p className="text-lg text-zinc-600">
            Choose the perfect plan for your needs. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <plan.icon className="h-6 w-6 text-emerald-600" />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-zinc-900">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-zinc-900">{plan.price}</span>
                  <span className="text-zinc-600">{plan.period}</span>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full rounded-full py-3 text-center font-semibold transition ${
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-zinc-200 text-zinc-900 hover:border-zinc-300"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900">Credit System</h2>
          <p className="mb-8 text-zinc-600">
            Purchase credits to boost listings, increase visibility, and unlock premium features on-demand.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <p className="mb-2 text-2xl font-bold text-zinc-900">100 Credits</p>
              <p className="text-sm text-zinc-600">£9.99</p>
            </div>
            <div className="rounded-xl border border-emerald-500 bg-emerald-50 p-6">
              <p className="mb-2 text-2xl font-bold text-zinc-900">500 Credits</p>
              <p className="text-sm text-zinc-600">£39.99</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                Best Value
              </span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <p className="mb-2 text-2xl font-bold text-zinc-900">1000 Credits</p>
              <p className="text-sm text-zinc-600">£69.99</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

