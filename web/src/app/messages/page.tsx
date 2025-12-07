import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, User } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTimeFromNow } from "@/lib/formatters";

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Kullanıcının konuşmalarını çek
  // Use parameterized query to avoid SQL injection risks
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      user1_id,
      user2_id,
      listing_id,
      updated_at,
      listing:listings(id, title, thumbnail_url, images),
      user1:profiles!conversations_user1_id_fkey(id, username, display_name, avatar_url),
      user2:profiles!conversations_user2_id_fkey(id, username, display_name, avatar_url),
      messages(
        id,
        content,
        sender_id,
        is_read,
        created_at
      )
    `)
    .or(`user1_id.eq."${user.id}",user2_id.eq."${user.id}"`)
    .order("updated_at", { ascending: false });

  // Her konuşma için karşı tarafı ve son mesajı belirle
  const conversationsData = (conversations || []) as any[];
  const conversationsWithDetails = conversationsData.map((conv: any) => {
    const otherUser = conv.user1_id === user.id ? conv.user2 : conv.user1;
    const lastMessage = conv.messages?.[conv.messages.length - 1];
    const unreadCount = conv.messages?.filter(
      (msg: any) => msg.sender_id !== user.id && !msg.is_read
    ).length || 0;

    return {
      ...conv,
      otherUser,
      lastMessage,
      unreadCount,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">Messages</h1>
          <p className="mt-1 text-sm text-zinc-600">
            All your conversations are here
          </p>
        </div>

        {/* Konuşma Listesi */}
        {conversationsWithDetails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">
              You don't have any messages yet
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Click on a product to contact the seller
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversationsWithDetails.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {conversation.otherUser?.avatar_url ? (
                    <img
                      src={conversation.otherUser.avatar_url}
                      alt={conversation.otherUser.display_name || conversation.otherUser.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd]">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* İsim ve Zaman */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900 truncate">
                        {conversation.otherUser?.display_name || conversation.otherUser?.username}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-zinc-500 flex-shrink-0">
                          {formatRelativeTimeFromNow(conversation.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    {/* Ürün Bilgisi */}
                    {conversation.listing && (
                      <p className="text-xs text-zinc-500 truncate">
                        {conversation.listing.title}
                      </p>
                    )}

                    {/* Son Mesaj */}
                    {conversation.lastMessage && (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 && conversation.lastMessage.sender_id !== user.id
                            ? "font-semibold text-zinc-900"
                            : "text-zinc-600"
                        }`}>
                          {conversation.lastMessage.sender_id === user.id && "You: "}
                          {conversation.lastMessage.content}
                        </p>
                        
                        {/* Okunmamış Sayısı */}
                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ürün Resmi (varsa) */}
                  {conversation.listing && (conversation.listing.thumbnail_url || conversation.listing.images?.[0]) && (
                    <img
                      src={conversation.listing.thumbnail_url || conversation.listing.images[0]}
                      alt={conversation.listing.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

