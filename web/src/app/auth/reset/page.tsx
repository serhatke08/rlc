"use client";

import Link from "next/link";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStatus("success");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Yeni şifreni oluştur</h1>
        <p className="text-sm text-zinc-500">
          Emailine gelen bağlantı sayesinde buradasın. Yeni şifreni belirle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Yeni şifre
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Yeni şifre (tekrar)
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Şifren güncellendi. Giriş yapabilirsin.</p>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
        >
          Şifreyi güncelle
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-500">
          Giriş sayfasına dön
        </Link>
      </p>
    </div>
  );
}

