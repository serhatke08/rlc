'use client';

import { useState } from "react";
import { Send } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface MessageInputProps {
  conversationId: string;
  receiverId: string;
  listingId?: string | null;
}

export function MessageInput({ conversationId, receiverId, listingId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setLoading(true);

    try {
      // Mesaj gönder (listing_id ile)
      const { error } = await (supabase.rpc as any)("send_message", {
        p_sender_id: user.id,
        p_receiver_id: receiverId,
        p_content: message.trim(),
        p_listing_id: listingId || null,
      });

      if (error) {
        console.error("Mesaj gönderme hatası:", error);
        alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      } else {
        setMessage("");
        // Sayfayı yenile (mesajlar otomatik güncellenecek)
        window.location.reload();
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Mesaj yazın..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] p-3 text-white transition hover:scale-105 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

