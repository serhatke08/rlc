"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface ProfileFormProps {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string;
    website: string;
    avatar_url: string;
  };
}

export function AccountProfileForm({ profile }: ProfileFormProps) {
  const [form, setForm] = useState(profile);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await (supabase
      .from("profiles") as any)
      .update({
        username: form.username,
        display_name: form.display_name,
        bio: form.bio,
        website: form.website,
      })
      .eq("id", profile.id);

    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }
    setStatus("success");
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Profil Bilgileri</h2>
      <p className="text-sm text-zinc-500">Toplulukta görünecek isim ve bilgi kartın.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Kullanıcı adı
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Görünen ad
          <input
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Web sitesi
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Biyografi
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {status === "success" ? (
          <p className="text-sm text-emerald-600">Profil güncellendi.</p>
        ) : null}
        {status === "error" && error ? (
          <p className="text-sm text-rose-500">{error}</p>
        ) : null}

        <button
          type="submit"
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Bilgileri kaydet
        </button>
      </form>
    </section>
  );
}

