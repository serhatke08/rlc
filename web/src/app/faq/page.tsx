import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Frequently Asked Questions - ReloopCycle",
  description: "Find answers to common questions about ReloopCycle. Learn how to buy, sell, swap, and give away items on our platform.",
  keywords: ["faq", "help", "questions", "how to use reloopcycle"],
};

export default function FAQPage() {
  const faqs = [
    {
      question: "Is ReloopCycle free to use?",
      answer: "Yes! Creating an account and posting up to 5 listings is completely free. We also offer premium plans with additional features.",
    },
    {
      question: "How do I list an item?",
      answer: "Click 'Add' from the navigation, add photos and description, choose if it's free/swap/sale, and publish. It's that simple!",
    },
    {
      question: "Is it safe to meet buyers/sellers?",
      answer: "We recommend meeting in public places during daylight hours. Always trust your instincts and bring a friend if needed.",
    },
    {
      question: "Can I swap items for other items?",
      answer: "Absolutely! Just select 'Swap' when creating your listing and specify what you're looking for in return.",
    },
    {
      question: "What areas do you cover?",
      answer: "We're available across the UK with listings in 40+ cities. Select your location to see items near you.",
    },
    {
      question: "How do I message a seller?",
      answer: "Click on any listing and use the 'Contact Seller' button. Our secure messaging system lets you arrange collection.",
    },
    {
      question: "Can I edit my listing after posting?",
      answer: "Yes, go to your account, find your listing, and click edit to update photos, price, or description anytime.",
    },
    {
      question: "What if I want to delete my listing?",
      answer: "You can delete any listing from your account dashboard. Click the three dots on your listing and select 'Delete'.",
    },
    {
      question: "Do you take a commission?",
      answer: "No! We don't charge any commission on sales. You keep 100% of what you earn.",
    },
    {
      question: "How do premium features work?",
      answer: "Premium subscribers get unlimited listings, priority support, featured placement, and analytics. See our subscription page for details.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 lg:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-zinc-600">
            Everything you need to know about ReloopCycle
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                  {faq.question}
                </h3>
                <p className="text-zinc-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900">Still have questions?</h2>
          <p className="mb-6 text-zinc-600">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}

