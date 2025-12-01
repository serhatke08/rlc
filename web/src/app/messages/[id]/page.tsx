import { redirect, notFound } from "next/navigation";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTimeFromNow } from "@/lib/formatters";
import { MessageInput } from "@/components/message-input";

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
      listing:listings(id, title, thumbnail_url, images),
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
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
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
                  <MessageCircle className="h-5 w-5 text-white" />
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
        <div className="border-b border-zinc-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <Link 
              href={`/listing/${conversationData.listing.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              {/* Ürün Görseli */}
              {conversationData.listing.thumbnail_url || conversationData.listing.images?.[0] ? (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                  <Image
                    src={conversationData.listing.thumbnail_url || conversationData.listing.images[0]}
                    alt={conversationData.listing.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 flex-shrink-0 rounded-lg border border-zinc-200 bg-zinc-100" />
              )}
              
              {/* Ürün Bilgisi */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">About:</p>
                <p className="font-medium text-zinc-900 line-clamp-2">{conversationData.listing.title}</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {messagesData && messagesData.length > 0 ? (
            messagesData.map((message: any) => {
              const isOwn = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] text-white"
                        : "bg-white text-zinc-900 shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwn ? "text-white/70" : "text-zinc-500"
                      }`}
                    >
                      {formatRelativeTimeFromNow(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-500">Henüz mesaj yok. İlk mesajı sen gönder!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mesaj Input */}
      <MessageInput 
        conversationId={id} 
        receiverId={otherUser?.id || ""} 
        listingId={conversationData.listing_id}
      />
    </div>
  );
}

