'use client';

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MessageSquare, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Feedback {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  replies?: FeedbackReply[];
}

interface FeedbackReply {
  id: string;
  feedback_id: string;
  admin_id: string | null;
  reply_text: string;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/auth/login';
        return;
      }
      setUser(session.user);
      await loadFeedbacks(supabase);
    };

    checkUser();
  }, []);

  const loadFeedbacks = async (supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Her feedback için reply'leri yükle
      const feedbacksWithReplies = await Promise.all(
        (data || []).map(async (feedback: Feedback) => {
          const { data: replies } = await supabase
            .from('feedback_replies')
            .select('*')
            .eq('feedback_id', feedback.id)
            .order('created_at', { ascending: true });

          return { ...feedback, replies: replies || [] };
        })
      );

      setFeedbacks(feedbacksWithReplies);
    } catch (err) {
      console.error('Error loading feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedFeedback || !replyText.trim() || !user) return;

    setSendingReply(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .insert({
          feedback_id: selectedFeedback.id,
          admin_id: user.id,
          reply_text: replyText.trim(),
        });

      if (error) throw error;

      // Feedback status'unu güncelle
      await supabase
        .from('feedback')
        .update({ status: 'reviewed' })
        .eq('id', selectedFeedback.id);

      setReplyText("");
      await loadFeedbacks(supabase);
      setSelectedFeedback(null);
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Cevap gönderilirken bir hata oluştu.');
    } finally {
      setSendingReply(false);
    }
  };

  const updateStatus = async (feedbackId: string, status: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId);

    if (!error) {
      await loadFeedbacks(supabase);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="text-zinc-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Geri Bildirim Yönetimi</h1>
          <p className="mt-2 text-zinc-600">Kullanıcı geri bildirimlerini görüntüleyin ve cevaplayın</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Feedback Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {feedbacks.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-4 text-zinc-600">Henüz geri bildirim yok</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`rounded-2xl border bg-white p-6 transition hover:shadow-md ${
                    selectedFeedback?.id === feedback.id
                      ? 'border-emerald-500 shadow-lg'
                      : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {feedback.type === 'feedback' && 'Geri Bildirim'}
                          {feedback.type === 'bug_report' && 'Hata Bildirimi'}
                          {feedback.type === 'feature_request' && 'Özellik Önerisi'}
                          {feedback.type === 'other' && 'Diğer'}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          feedback.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                          feedback.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-zinc-100 text-zinc-700'
                        }`}>
                          {feedback.status === 'pending' && 'Beklemede'}
                          {feedback.status === 'reviewed' && 'İncelendi'}
                          {feedback.status === 'resolved' && 'Çözüldü'}
                          {feedback.status === 'closed' && 'Kapatıldı'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900">{feedback.subject}</h3>
                      <p className="mt-2 text-sm text-zinc-600">{feedback.name} ({feedback.email})</p>
                      <p className="mt-3 text-sm text-zinc-700">{feedback.message}</p>
                      <p className="mt-2 text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="ml-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      {selectedFeedback?.id === feedback.id ? 'Seçili' : 'Cevap Ver'}
                    </button>
                  </div>

                  {feedback.replies && feedback.replies.length > 0 && (
                    <div className="mt-4 border-t border-zinc-200 pt-4">
                      <h4 className="mb-2 text-sm font-semibold text-zinc-900">Cevaplar:</h4>
                      {feedback.replies.map((reply) => (
                        <div key={reply.id} className="mb-2 rounded-lg bg-zinc-50 p-3">
                          <p className="text-sm text-zinc-700">{reply.reply_text}</p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cevap Paneli */}
          <div className="lg:col-span-1">
            {selectedFeedback ? (
              <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900">Cevap Yaz</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Cevabınızı buraya yazın..."
                />
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="w-full rounded-xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#9c6cfe]/30 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReply ? 'Gönderiliyor...' : 'Cevap Gönder'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(selectedFeedback.id, 'resolved')}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Çözüldü
                    </button>
                    <button
                      onClick={() => updateStatus(selectedFeedback.id, 'closed')}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                    >
                      Kapat
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFeedback(null);
                      setReplyText("");
                    }}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-4 text-sm text-zinc-600">Cevap vermek için bir geri bildirim seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

