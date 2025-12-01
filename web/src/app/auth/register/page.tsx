"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Country {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    displayName: "",
    countryId: "",
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ülkeleri yükle
  useEffect(() => {
    const loadCountries = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("countries")
        .select("id, name, code, flag_emoji")
        .order("name");

      if (error) {
        console.error("Error loading countries:", error);
      } else if (data) {
        // Duplicate'leri temizle - code'a göre unique yap
        const countriesData = data as any[];
        const uniqueCountries = countriesData.reduce((acc: Country[], country: any) => {
          const exists = acc.find((c) => c.code === country.code);
          if (!exists) {
            acc.push(country as Country);
          }
          return acc;
        }, []);
        
        setCountries(uniqueCountries);
        // Varsayılan olarak United Kingdom'ı seç
        const uk = uniqueCountries.find((c) => c.code === "GB");
        if (uk) {
          setForm((prev) => ({ ...prev, countryId: uk.id }));
        }
      }
      setLoadingCountries(false);
    };

    loadCountries();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (!form.countryId) {
      setError("Lütfen bir ülke seçin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            display_name: form.displayName || form.username,
          },
        },
      });
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Profil oluşturulduktan sonra country_id'yi güncelle
      if (authData.user) {
        const { error: updateError } = await (supabase
          .from("profiles") as any)
          .update({ country_id: form.countryId })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("Error updating country_id:", updateError);
          // Hata olsa bile kayıt başarılı, sadece logla
        }
      }

      setSuccess(true);
      router.push("/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Topluluğa katıl</h1>
        <p className="text-sm text-zinc-500">Ücretsiz paylaşım ve takas için hesabını oluştur.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Kullanıcı adı
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          İsim (opsiyonel)
          <input
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Gerçek adınız"
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Ülke
          {loadingCountries ? (
            <div className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-500">
              Yükleniyor...
            </div>
          ) : (
          <select
              name="countryId"
              value={form.countryId}
              onChange={(e) => setForm((prev) => ({ ...prev, countryId: e.target.value }))}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
              <option value="">Ülke seçin</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.flag_emoji || ""}
                </option>
              ))}
          </select>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Şifre
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Şifre (tekrar)
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">Hesap oluşturuldu. Yönlendiriliyorsun...</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Kaydediliyor..." : "Hesap oluştur"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Hesabın var mı?{" "}
        <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-500">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}

