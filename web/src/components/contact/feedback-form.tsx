'use client';

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "feedback" as "feedback" | "bug_report" | "feature_request" | "other",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Kullanıcı giriş yapmışsa user_id'yi al
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const { error: insertError } = await supabase
        .from("feedback")
        .insert({
          user_id: userId,
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          type: form.type,
        });

      if (insertError) {
        // Tablo yoksa veya başka bir hata varsa kullanıcıya bilgi ver
        if (insertError.code === '42P01' || insertError.message?.includes('does not exist') || insertError.message?.includes('relation') || insertError.message?.includes('table')) {
          throw new Error('Geri bildirim tablosu henüz oluşturulmamış. Lütfen admin ile iletişime geçin veya daha sonra tekrar deneyin.');
        }
        throw insertError;
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "feedback",
      });

      // 3 saniye sonra success mesajını kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-zinc-900">
            Geri Bildirim Gönderin
          </h2>
          <p className="text-zinc-600">
            Görüşleriniz, önerileriniz veya sorun bildirimleriniz bizim için çok değerli.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-zinc-900">
                Adınız *
              </label>
              <input
                type="text"
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Adınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-zinc-900">
                E-posta *
              </label>
              <input
                type="email"
                id="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-semibold text-zinc-900">
              Kategori *
            </label>
            <select
              id="type"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="feedback">Geri Bildirim</option>
              <option value="bug_report">Hata Bildirimi</option>
              <option value="feature_request">Özellik Önerisi</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-zinc-900">
              Konu *
            </label>
            <input
              type="text"
              id="subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Konu başlığı"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-semibold text-zinc-900">
              Mesajınız *
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#9c6cfe]/30 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gönderiliyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Gönder
              </span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

