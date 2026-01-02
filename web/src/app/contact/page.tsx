import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | ReloopCycle Support",
  description: "Get in touch with ReloopCycle. We're here to help with questions about our circular economy marketplace.",
  keywords: ["contact reloopcycle", "customer support", "help", "get in touch"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-5xl">
            Contact Us
          </h1>
          <p className="text-lg text-zinc-600">
            Have questions? We're here to help. Reach out to our team.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Email</h3>
              <p className="text-sm text-zinc-600">support@reloopcycle.co.uk</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <MessageCircle className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Live Chat</h3>
              <p className="text-sm text-zinc-600">Available 9am-5pm GMT</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <MapPin className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900">Location</h3>
              <p className="text-sm text-zinc-600">London, United Kingdom</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

