"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AccountDangerZone() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Hesabını ve tüm ilanlarını silmek istediğine emin misin? Bu işlem geri alınamaz.",
    );
    if (!confirmDelete) return;

    setLoading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("delete_user_account");
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/auth/register");
  };

  return (
    <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-600">Hesap işlemleri</h2>
      <p className="text-sm text-rose-400">Çıkış yapabilir veya hesabını tamamen silebilirsin.</p>

      {message ? <p className="mt-4 text-sm text-rose-500">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-70"
        >
          Çıkış yap
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-70"
        >
          Hesabı Sil
        </button>
      </div>
    </section>
  );
}

