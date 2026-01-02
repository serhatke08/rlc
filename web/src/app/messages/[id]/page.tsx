import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTimeFromNow } from "@/lib/formatters";
import { MessageInput } from "@/components/message-input";
import { SendAgreementButton } from "@/components/messages/send-agreement-button";
import { MessagesChatClient } from "@/components/messages/messages-chat-client";
import { ListingLink } from "@/components/messages/listing-link";

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Konuşmayı çek
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(`
      id,
      user1_id,
      user2_id,
      listing_id,
      listing:listings(id, title, thumbnail_url, images, seller_id),
      user1:profiles!conversations_user1_id_fkey(id, username, display_name, avatar_url),
      user2:profiles!conversations_user2_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error || !conversation) {
    notFound();
  }

  const conversationData = conversation as any;

  // Kullanıcının bu konuşmaya erişim hakkı var mı kontrol et
  if (conversationData.user1_id !== user.id && conversationData.user2_id !== user.id) {
    redirect("/messages");
  }

  // Karşı tarafı belirle
  const otherUser = conversationData.user1_id === user.id ? conversationData.user2 : conversationData.user1;
  
  // Bu konuşma kullanıcının kendi ürününe mi ait?
  const isMyListing = conversationData.listing_id && conversationData.listing?.id 
    ? conversationData.listing.seller_id === user.id 
    : false;

  // Mesajları çek
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at
    `)
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messagesData = (messages || []) as any[];

  // Okunmamış mesajları işaretle
  if (messagesData && messagesData.length > 0) {
    await (supabase
      .from("messages") as any)
      .update({ is_read: true })
      .eq("conversation_id", id)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-3 py-2.5">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/messages"
            className="flex-shrink-0 text-zinc-600 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          {otherUser && (
            <div className="flex flex-1 items-center gap-3">
              {otherUser.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.display_name || otherUser.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                  <span className="text-lg font-semibold text-white">
                    {(otherUser.display_name || otherUser.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-zinc-900">
                  {otherUser.display_name || otherUser.username}
                </p>
                <p className="text-xs text-zinc-500">@{otherUser.username}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ürün Bilgisi (varsa) */}
      {conversationData.listing && (
        <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-3 py-2.5">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between gap-2">
              <ListingLink
                listingId={conversationData.listing.id}
                title={conversationData.listing.title}
                thumbnailUrl={conversationData.listing.thumbnail_url}
                images={conversationData.listing.images}
              />
              
              {/* Anlaşma Gönder Butonu - Sadece kullanıcının kendi ürününe mesaj atıldıysa */}
              {isMyListing && otherUser && (
                <SendAgreementButton 
                  listingId={conversationData.listing.id}
                  buyerId={otherUser.id}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mesajlar - Client component ile scroll to bottom */}
      <MessagesChatClient 
        messages={messagesData}
        currentUserId={user.id}
      />

      {/* Mesaj Input - Her zaman altta */}
      <div className="flex-shrink-0">
        <MessageInput 
          conversationId={id} 
          receiverId={otherUser?.id || ""} 
          listingId={conversationData.listing_id}
        />
      </div>
    </div>
  );
}
