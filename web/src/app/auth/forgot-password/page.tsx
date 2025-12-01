"use client";

import Link from "next/link";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Şifreni sıfırla</h1>
        <p className="text-sm text-zinc-500">
          Email adresine şifre yenileme bağlantısı gönderelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        {status === "sent" ? (
          <p className="text-sm text-emerald-600">
            Bağlantı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
        >
          Bağlantıyı gönder
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Giriş ekranına dön{" "}
        <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-500">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}

