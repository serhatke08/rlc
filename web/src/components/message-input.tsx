'use client';

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
  receiverId: string;
  listingId?: string | null;
}

export function MessageInput({ conversationId, receiverId, listingId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

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
        alert(`Failed to send message: ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      if (data.success) {
        setMessage("");
        setLoading(false);
        // Message sent, will be automatically updated via realtime subscription
        // No need to refresh page
      } else {
        alert("Failed to send message. Please try again.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(`An error occurred: ${error?.message || JSON.stringify(error)}`);
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
    <div className="flex-shrink-0 border-t border-zinc-200 bg-white px-3 py-2.5">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] p-3 text-white shadow-sm transition hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

