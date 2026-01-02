'use client';

import { useEffect, useRef } from "react";
import { formatRelativeTimeFromNow } from "@/lib/formatters";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface MessagesChatClientProps {
  messages: Message[];
  currentUserId: string;
}

export function MessagesChatClient({ messages, currentUserId }: MessagesChatClientProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Her zaman son mesaja scroll et
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
      <div className="mx-auto max-w-2xl space-y-2.5">
        {messages && messages.length > 0 ? (
          <>
            {messages.map((message: Message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] text-white"
                        : "bg-white text-zinc-900 shadow-sm border border-zinc-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`mt-1.5 text-[10px] ${
                        isOwn ? "text-white/70" : "text-zinc-500"
                      }`}
                    >
                      {formatRelativeTimeFromNow(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-500">No messages yet. Send the first message!</p>
          </div>
        )}
      </div>
    </div>
  );
}

