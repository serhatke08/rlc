import type { Metadata } from "next";

import { DeleteAccountForm } from "./delete-account-form";

export const metadata: Metadata = {
  title: {
    absolute: "Delete İkel - Second Hand items account | Webnotic",
  },
  description:
    "Official account deletion page for İkel - Second Hand items (com.reloopcycle.app), published by Webnotic. Permanently delete the İkel account and associated data.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Webnotic
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">
          Delete İkel - Second Hand items account
        </h1>
        <p className="text-sm text-zinc-600">
          This is the official account deletion page for the Android app{" "}
          <strong>İkel - Second Hand items</strong> (<code>com.reloopcycle.app</code>),
          developed by <strong>Webnotic</strong>. The same account is used on İkel
          (reloopcycle.co.uk).
        </p>
      </header>
      <DeleteAccountForm />
    </main>
  );
}
