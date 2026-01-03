'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Edit } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface MessageButtonProps {
  listingId: string;
  sellerId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

export function MessageButton({ listingId, sellerId, currentUserId, isOwner }: MessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMessage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = "/auth/login";
      return;
    }

    if (isOwner) {
      // Kendi ilanıysa düzenle sayfasına git
      window.location.href = `/edit-listing/${listingId}`;
      return;
    }

    setLoading(true);

    try {
      console.log("Creating conversation:", { currentUserId, sellerId, listingId });
      
      // API route kullan (server-side, RLS bypass eder)
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId,
          listingId
        })
      });

      const data = await response.json();
      console.log("API Response:", { status: response.status, data });

      if (!response.ok) {
        console.error("Failed to create conversation:", data);
        alert(`Failed to send message: ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      if (!data.conversationId) {
        console.error("No conversation ID returned");
        alert("Failed to create conversation. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Redirecting to conversation:", data.conversationId);
      
      // Hem mobilde hem desktop'ta aynı route kullan (PC gibi çalışsın)
      // sellerId ve listingId'yi de query parameter'a ekle (minimal conversation oluşturmak için)
      router.push(`/messages?conversation=${data.conversationId}&sellerId=${sellerId}&listingId=${listingId}`);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`An error occurred: ${error?.message || JSON.stringify(error)}`);
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <button
        type="button"
        onClick={handleMessage}
        disabled={loading}
        className="w-full rounded-full border-2 border-emerald-600 bg-white px-6 py-3 font-semibold text-emerald-600 shadow-md transition hover:bg-emerald-50 hover:scale-[1.02] disabled:opacity-50"
      >
        <Edit className="mr-2 inline-block h-5 w-5" />
        {loading ? "Redirecting..." : "Edit"}
      </button>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa, buton göster ama login'e yönlendir
  if (!currentUserId) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = "/auth/login";
        }}
        className="w-full rounded-full bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02]"
      >
        <MessageCircle className="mr-2 inline-block h-5 w-5" />
        Message
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleMessage}
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] disabled:opacity-50"
    >
      <MessageCircle className="mr-2 inline-block h-5 w-5" />
      {loading ? "Redirecting..." : "Message"}
    </button>
  );
}

