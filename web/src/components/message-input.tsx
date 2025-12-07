'use client';

import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
  receiverId: string;
  listingId?: string | null;
}

export function MessageInput({ conversationId, receiverId, listingId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    // Input validation and sanitization
    const sanitizedMessage = message.trim();
    
    if (!sanitizedMessage || loading) return;
    
    // Length validation (max 5000 characters)
    if (sanitizedMessage.length > 5000) {
      alert("Message is too long. Maximum 5000 characters allowed.");
      return;
    }

    // Additional validation: check for only whitespace
    if (sanitizedMessage.length === 0) return;

    setLoading(true);

    try {
      console.log("Sending message:", { receiverId, listingId, contentLength: sanitizedMessage.length });
      
      // API route kullan (server-side, RLS bypass eder)
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          content: sanitizedMessage,
          listingId: listingId || null
        })
      });

      const data = await response.json();
      console.log("Send message API response:", { status: response.status, data });

      if (!response.ok) {
        console.error("Failed to send message:", data);
        alert(`Mesaj gönderilemedi: ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      if (data.success) {
        setMessage("");
        // Sayfayı yenile (mesajlar otomatik güncellenecek)
        window.location.reload();
      } else {
        alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Bir hata oluştu: ${error?.message || JSON.stringify(error)}`);
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

