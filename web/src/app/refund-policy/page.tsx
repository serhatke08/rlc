import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | ReloopCycle",
  description: "ReloopCycle Refund Policy. Learn about our refund terms for credits and subscriptions.",
  keywords: ["refund policy", "money back", "returns"],
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900">Refund Policy</h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: January 2025</p>

        <article className="prose prose-zinc max-w-none">
          <h2>1. Overview</h2>
          <p>
            At ReloopCycle, we strive to provide the best possible service. This refund policy outlines 
            the circumstances under which refunds may be issued for our services.
          </p>

          <h2>2. Free Services</h2>
          <p>
            Our basic platform features are free to use and do not require payment. No refunds are 
            applicable for free services.
          </p>

          <h2>3. Subscription Refunds</h2>
          <p>
            <strong>Monthly Subscriptions:</strong> You may cancel at any time, but refunds are not 
            provided for the current billing period. Your subscription will remain active until the 
            end of the paid period.
          </p>
          <p>
            <strong>Annual Subscriptions:</strong> Refunds may be provided within 14 days of purchase 
            if no premium features have been used. After 14 days, no refunds will be issued.
          </p>

          <h2>4. Credit Purchases</h2>
          <p>
            Credits purchased on our platform are generally non-refundable. Exceptions may be made in 
            the following circumstances:
          </p>
          <ul>
            <li>Technical error resulted in duplicate charges</li>
            <li>Credits were not delivered to your account</li>
            <li>Platform error prevented credit usage</li>
          </ul>
          <p>
            Refund requests for credits must be submitted within 7 days of purchase and before credits 
            have been used.
          </p>

          <h2>5. Payment Issues</h2>
          <p>
            If you were charged incorrectly due to a technical error, we will refund the incorrect 
            amount within 5-10 business days. Please contact support immediately if you notice any 
            unauthorized charges.
          </p>

          <h2>6. Refund Process</h2>
          <p>To request a refund:</p>
          <ol>
            <li>Contact our support team at support@reloopcycle.com</li>
            <li>Provide your account details and transaction ID</li>
            <li>Explain the reason for your refund request</li>
            <li>Allow 5-10 business days for processing</li>
          </ol>

          <h2>7. Refund Method</h2>
          <p>
            Approved refunds will be processed to the original payment method used for the purchase. 
            Refunds typically appear in your account within 5-10 business days, depending on your 
            bank or payment provider.
          </p>

          <h2>8. Promotional Offers</h2>
          <p>
            Services or credits obtained through promotional offers, discounts, or free trials are 
            not eligible for refunds unless specifically stated in the promotion terms.
          </p>

          <h2>9. Right to Refuse</h2>
          <p>
            We reserve the right to refuse refund requests that do not meet our policy criteria or 
            appear to be fraudulent or abusive.
          </p>

          <h2>10. Changes to Policy</h2>
          <p>
            This refund policy may be updated from time to time. Changes will be posted on this page 
            with the updated date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For refund requests or questions about this policy, please contact us at: 
            refunds@reloopcycle.com
          </p>
        </article>
      </div>
    </div>
  );
}

