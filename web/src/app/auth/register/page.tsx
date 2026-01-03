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
  const [emailSent, setEmailSent] = useState(false);

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
    
    // Username için özel kontrol - boşluk yerine _ kullan
    if (name === "username") {
      // Boşlukları _ ile değiştir
      const sanitizedValue = value.replace(/\s+/g, "_");
      setForm((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
    setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validation
    if (!form.username || form.username.trim() === "") {
      setError("Username is required.");
      return;
    }
    
    if (form.username.includes(" ")) {
      setError("Username cannot contain spaces. Use underscore (_) instead.");
      return;
    }
    
    if (!form.displayName || form.displayName.trim() === "") {
      setError("Name is required.");
      return;
    }
    
    if (!form.email || form.email.trim() === "") {
      setError("Email is required.");
      return;
    }
    
    if (!form.password || form.password.trim() === "") {
      setError("Password is required.");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.countryId) {
      setError("Please select a country.");
      return;
    }

    setLoading(true);
    setError(null);
    setEmailSent(false);
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

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        return;
      }

      // Profil oluşturulduktan sonra country_id ve display_name'i güncelle
      // Email confirmation gereksin veya gereksin, profil güncellemesi yap
      const { error: updateError } = await (supabase
        .from("profiles") as any)
        .update({ 
          country_id: form.countryId,
          display_name: form.displayName || form.username
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        // Hata olsa bile kayıt başarılı, sadece logla
      }

      // Check if email confirmation is required
      if (!authData.user.email_confirmed_at) {
        // Email confirmation required - show message box
        setEmailSent(true);
        setLoading(false);
        return;
      }

      router.push("/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {emailSent ? (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Check Your Email</h1>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-lg font-semibold text-zinc-900">Please verify your email</h2>
                  <p className="text-sm text-zinc-600">
                    We've sent a confirmation email to <span className="font-semibold text-zinc-900">{form.email}</span>
                  </p>
                  <div className="space-y-2 text-sm text-zinc-600">
                    <p>• Check your inbox and click the verification link</p>
                    <p>• Don't forget to check your spam folder</p>
                    <p>• If you didn't receive the email, please try again</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-emerald-200">
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">ReloopCycle</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Join the Community</h1>
            <p className="text-sm text-zinc-500">Create your account for free sharing and swapping.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Username *
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="username_no_spaces"
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores. No spaces allowed."
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <p className="text-xs text-zinc-500">Only letters, numbers, and underscore (_). Spaces will be replaced with _.</p>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Name *
          <input
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Country *
          {loadingCountries ? (
            <div className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-500">
              Loading...
            </div>
          ) : (
          <select
              name="countryId"
              value={form.countryId}
              onChange={(e) => setForm((prev) => ({ ...prev, countryId: e.target.value }))}
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.flag_emoji || ""}
                </option>
              ))}
          </select>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Email *
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
          Password *
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
          Confirm Password *
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

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-500">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

