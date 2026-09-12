"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

type Step = "credentials" | "confirm" | "done";

type VerifiedAccount = {
  username: string;
  displayName: string | null;
  emailMasked: string;
};

export function DeleteAccountForm() {
  const [step, setStep] = useState<Step>("credentials");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState<VerifiedAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await response.json()) as { error?: string } & Partial<VerifiedAccount>;

      if (!response.ok) {
        throw new Error(data.error || "Could not verify this ReloopCycle account.");
      }

      if (!data.username || !data.emailMasked) {
        throw new Error("Could not verify this ReloopCycle account.");
      }

      setAccount({
        username: data.username,
        displayName: data.displayName ?? null,
        emailMasked: data.emailMasked,
      });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify this ReloopCycle account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete this ReloopCycle account.");
      }

      setPassword("");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete this ReloopCycle account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
        <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <Image
              src="/yenilogo.png"
              alt="ReloopCycle"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                ReloopCycle
              </p>
              <h1 className="text-xl font-bold text-zinc-900">Delete account</h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            This page deletes a ReloopCycle app and website account (reloopcycle.co.uk). Enter the
            username and password for that account first. Delete is shown only after the login is
            verified.
          </p>
        </div>

        <div className="px-6 py-6">
          {step === "credentials" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Username
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setError(null);
                  }}
                  required
                  placeholder="Username or email"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  required
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking account…
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              <p className="text-xs text-zinc-500">
                Signed up with Google and have no password? Sign in with Google on ReloopCycle, then
                delete from Account settings. Help:{" "}
                <a className="font-medium text-emerald-700" href="mailto:support@reloopcycle.co.uk">
                  support@reloopcycle.co.uk
                </a>
              </p>
            </form>
          ) : null}

          {step === "confirm" && account ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  ReloopCycle account
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  {account.displayName || account.username}
                </p>
                <p className="text-sm text-zinc-600">@{account.username}</p>
                <p className="text-sm text-zinc-500">{account.emailMasked}</p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-semibold">This cannot be undone</p>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-red-800">
                  <li>Profile and personal information</li>
                  <li>Listings, messages, and conversations</li>
                  <li>Favourites and follow relationships</li>
                </ul>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep("credentials");
                    setAccount(null);
                    setPassword("");
                    setError(null);
                  }}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDelete}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold text-zinc-900">Account deleted</h2>
              <p className="text-sm text-zinc-600">
                The ReloopCycle account
                {account ? ` @${account.username}` : ""} has been permanently deleted.
              </p>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Back to ReloopCycle
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
