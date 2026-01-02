import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ReloopCycle",
  description: "ReloopCycle Privacy Policy. Learn how we collect, use, and protect your personal information.",
  keywords: ["privacy policy", "data protection", "GDPR"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900">Privacy Policy</h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: January 2025</p>

        <article className="prose prose-zinc max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to ReloopCycle. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our 
            platform and tell you about your privacy rights.
          </p>

          <h2>2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul>
            <li><strong>Identity Data:</strong> username, display name</li>
            <li><strong>Contact Data:</strong> email address, location</li>
            <li><strong>Profile Data:</strong> listings, messages, preferences</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            <li><strong>Usage Data:</strong> how you use our platform</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We use your personal data to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your transactions and listings</li>
            <li>Send you communications about your account</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from being 
            accidentally lost, used, or accessed in an unauthorized way. We use Supabase for secure 
            data storage with encryption and regular security audits.
          </p>

          <h2>5. Your Legal Rights</h2>
          <p>Under data protection laws, you have rights including:</p>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request transfer of your personal data</li>
          </ul>

          <h2>6. Third-Party Links</h2>
          <p>
            Our platform may include links to third-party websites. We do not control these websites 
            and are not responsible for their privacy policies.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at: 
            privacy@reloopcycle.co.uk
          </p>
        </article>
      </div>
    </div>
  );
}

