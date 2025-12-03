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

  const handleMessage = async () => {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    if (isOwner) {
      // Kendi ilanıysa düzenle sayfasına git
      router.push(`/edit-listing/${listingId}`);
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Konuşmayı oluştur veya getir
      const { data: conversationId, error: convError } = await (supabase.rpc as any)(
        'get_or_create_conversation',
        {
          p_user1_id: currentUserId,
          p_user2_id: sellerId,
          p_listing_id: listingId
        }
      );

      if (convError || !conversationId) {
        console.error("Failed to create conversation:", convError);
        alert("Failed to send message. Please try again.");
        setLoading(false);
        return;
      }

      // Mesajlar sayfasına yönlendir
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <button
        onClick={handleMessage}
        disabled={loading}
        className="w-full rounded-full border-2 border-emerald-600 bg-white px-6 py-3 font-semibold text-emerald-600 shadow-md transition hover:bg-emerald-50 hover:scale-[1.02] disabled:opacity-50"
      >
        <Edit className="mr-2 inline-block h-5 w-5" />
        {loading ? "Redirecting..." : "Edit"}
      </button>
    );
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] disabled:opacity-50"
    >
      <MessageCircle className="mr-2 inline-block h-5 w-5" />
      {loading ? "Redirecting..." : currentUserId ? "Message" : "Sign in"}
    </button>
  );
}

