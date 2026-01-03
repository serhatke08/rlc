'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MessagesChatClient } from "./messages-chat-client";
import { MessageInput } from "@/components/message-input";
import { SendAgreementButton } from "./send-agreement-button";
import { ListingLink } from "./listing-link";

interface MessagesChatViewProps {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
  initialConversation?: any;
  initialMessages?: any[];
}

export function MessagesChatView({ conversationId, currentUserId, onBack, initialConversation, initialMessages }: MessagesChatViewProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(initialConversation || null);
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [loading, setLoading] = useState(!initialConversation);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();
    
    // Conversation ID değiştiğinde initial data'yı güncelle
    if (initialConversation && initialConversation.id === conversationId) {
      setConversation(initialConversation);
      setMessages(initialMessages || []);
      setLoading(false);
      
      // Realtime subscription
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (mounted) {
              setMessages((prev) => {
                const exists = prev.find(m => m.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as any];
              });
            }
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }
    
    // Initial data yoksa yükle
    setLoading(true);
    
    const loadConversation = async () => {
      try {
        // Konuşmayı çek - .single() yerine array kullan (RLS sorunlarını önlemek için)
        const { data: convArray, error } = await supabase
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
          .eq("id", conversationId)
          .limit(1);
        
        const conv = convArray && convArray.length > 0 ? convArray[0] : null;

        if (!mounted) return;

        if (error || !conv) {
          setLoading(false);
          setConversation(null);
          return;
        }

        // Kullanıcının bu konuşmaya erişim hakkı var mı kontrol et
        const convData = conv as any;
        if (convData.user1_id !== currentUserId && convData.user2_id !== currentUserId) {
          if (mounted) {
            setLoading(false);
            setConversation(null);
          }
          return;
        }

        setConversation(convData);

        // Mesajları çek
        const { data: msgs } = await supabase
          .from("messages")
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at
          `)
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (!mounted) return;

        setMessages(msgs || []);
        setLoading(false);

        // Okunmamış mesajları işaretle
        if (msgs && msgs.length > 0) {
          (supabase
            .from("messages") as any)
            .update({ is_read: true })
            .eq("conversation_id", conversationId)
            .eq("receiver_id", currentUserId)
            .eq("is_read", false)
            .then(() => {})
            .catch(() => {});
        }
      } catch (err) {
        if (mounted) {
          setLoading(false);
          setConversation(null);
        }
      }
    };

    loadConversation();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (mounted) {
            setMessages((prev) => {
              const exists = prev.find(m => m.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as any];
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, initialConversation, initialMessages]);

  if (loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-zinc-50">
        <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />
            <div className="flex-1">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="mt-1 h-3 w-16 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600"></div>
            <p className="mt-4 text-sm text-zinc-500">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-600">Conversation not found</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.user1_id === currentUserId ? conversation.user2 : conversation.user1;
  const isMyListing = conversation.listing_id && conversation.listing?.id 
    ? conversation.listing.seller_id === currentUserId 
    : false;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-3 py-2.5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              className="flex-shrink-0 text-zinc-600 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
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

      {/* Ürün Bilgisi (varsa) - Küçük yatay görünüm */}
      {conversation.listing && (
        <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <ListingLink
              listingId={conversation.listing.id}
              title={conversation.listing.title}
              thumbnailUrl={conversation.listing.thumbnail_url}
              images={conversation.listing.images}
            />
            
            {isMyListing && otherUser && (
              <SendAgreementButton 
                listingId={conversation.listing.id}
                buyerId={otherUser.id}
              />
            )}
          </div>
        </div>
      )}

      {/* Mesajlar */}
      <MessagesChatClient 
        messages={messages}
        currentUserId={currentUserId}
      />

      {/* Mesaj Input */}
      <div className="flex-shrink-0">
        <MessageInput 
          conversationId={conversationId} 
          receiverId={otherUser?.id || ""} 
          listingId={conversation.listing_id}
        />
      </div>
    </div>
  );
}

