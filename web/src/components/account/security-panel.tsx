"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AccountSecurityPanel({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      setStatus("error");
      return;
    }
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }
    setStatus("success");
    setPassword("");
    setConfirm("");
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Güvenlik</h2>
      <p className="text-sm text-zinc-500">Şifreni güncelle, hesabını güvende tut.</p>

      <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
        Giriş emaili: <span className="font-semibold text-zinc-900">{email}</span>
      </div>

      <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Yeni şifre
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Yeni şifre (tekrar)
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {status === "success" ? (
          <p className="text-sm text-emerald-600">Şifren güncellendi.</p>
        ) : null}
        {status === "error" && error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <button
          type="submit"
          className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Şifreyi güncelle
        </button>
      </form>
    </section>
  );
}

