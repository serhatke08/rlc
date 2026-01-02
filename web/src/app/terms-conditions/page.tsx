import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | ReloopCycle",
  description: "ReloopCycle Terms and Conditions. Read our terms of service for using the platform.",
  keywords: ["terms and conditions", "terms of service", "user agreement"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900">Terms & Conditions</h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: January 2025</p>

        <article className="prose prose-zinc max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using ReloopCycle, you accept and agree to be bound by these Terms and Conditions. 
            If you do not agree, please do not use our platform.
          </p>

          <h2>2. User Accounts</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your account information is accurate and up-to-date</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>

          <h2>3. Listing Guidelines</h2>
          <p>When creating listings, you must:</p>
          <ul>
            <li>Provide accurate and truthful descriptions</li>
            <li>Use your own photos or have permission to use them</li>
            <li>Not post prohibited items (weapons, illegal goods, etc.)</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Honor your commitments to buyers/traders</li>
          </ul>

          <h2>4. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use the platform for commercial purposes without authorization</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>

          <h2>5. Transactions</h2>
          <p>
            ReloopCycle facilitates connections between users but is not party to actual transactions. 
            We are not responsible for the quality, safety, or legality of items listed, or the ability 
            of users to complete transactions.
          </p>

          <h2>6. Payments and Fees</h2>
          <p>
            Basic use of ReloopCycle is free. Premium features and subscriptions are available for purchase. 
            All fees are non-refundable unless otherwise stated in our Refund Policy.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All content on ReloopCycle, including text, graphics, logos, and software, is our property 
            or licensed to us and is protected by copyright and other intellectual property laws.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            ReloopCycle is provided "as is" without warranties. We are not liable for any indirect, 
            incidental, or consequential damages arising from your use of the platform.
          </p>

          <h2>9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time for violating these 
            terms or for any other reason at our discretion.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform after changes 
            constitutes acceptance of the new terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            For questions about these terms, contact us at: legal@reloopcycle.co.uk
          </p>
        </article>
      </div>
    </div>
  );
}

