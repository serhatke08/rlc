'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageCircle, User, Trash2 } from "lucide-react";
import { formatRelativeTimeFromNow } from "@/lib/formatters";
import { MessagesChatView } from "./messages-chat-view";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  listing_id: string | null;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    images: string[] | null;
    seller_id?: string;
  };
  user1?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  user2?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  messages?: Array<{
    id: string;
    content: string;
    sender_id: string;
    is_read: boolean;
    created_at: string;
  }>;
  otherUser?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender_id: string;
    is_read: boolean;
    created_at: string;
  };
  isMyListing?: boolean;
}

interface MessagesLayoutProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export function MessagesLayout({ 
  initialConversations, 
  currentUserId
}: MessagesLayoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsDesktop(width >= 1280);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Konuşmaları kategorize et - useMemo ile optimize et
  const conversationsWithDetails = useMemo(() => {
    return conversations.map((conv) => {
      const otherUser = conv.user1_id === currentUserId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages?.[conv.messages.length - 1];
      
      // Bu konuşma kullanıcının kendi ürününe mi ait?
      const isMyListing = conv.listing_id && conv.listing?.id 
        ? conv.listing.seller_id === currentUserId 
        : false;

      return {
        ...conv,
        otherUser,
        lastMessage,
        isMyListing,
      };
    });
  }, [conversations, currentUserId]);

  // Mesaj atanlar (kullanıcıya mesaj atanlar) - useMemo ile optimize et
  // Sadece mesajı olan conversation'ları göster
  const receivedConversations = useMemo(() => {
    return conversationsWithDetails.filter((conv) => {
      // Mesaj yoksa gösterme
      const firstMessage = conv.messages?.[0];
      if (!firstMessage) {
        return false;
      }
      // İlk mesajı kim attı kontrol et
      return firstMessage.sender_id !== currentUserId;
    });
  }, [conversationsWithDetails, currentUserId]);

  // Benim mesaj attıklarım (kullanıcının mesaj attığı) - useMemo ile optimize et
  // Sadece mesajı olan conversation'ları göster
  const sentConversations = useMemo(() => {
    return conversationsWithDetails.filter((conv) => {
      // Mesaj yoksa gösterme
      const firstMessage = conv.messages?.[0];
      if (!firstMessage) {
        return false;
      }
      // İlk mesajı kullanıcı attı mı kontrol et
      return firstMessage.sender_id === currentUserId;
    });
  }, [conversationsWithDetails, currentUserId]);

  // Benim ürünüme mesaj atanlar (mobil için) - useMemo ile optimize et
  const receivedOnMyListings = useMemo(() => {
    return conversationsWithDetails.filter((conv) => {
      return conv.isMyListing && receivedConversations.includes(conv);
    });
  }, [conversationsWithDetails, receivedConversations]);

  // Query parameter'dan conversation ID'yi oku ve seç (sadece ilk yönlendirme için)
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    const sellerId = searchParams.get('sellerId');
    const listingId = searchParams.get('listingId');
    
    if (conversationId && selectedId !== conversationId) {
      // Hem mobilde hem desktop'ta aynı şekilde çalış: conversation'ı bul ve seç
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        // Conversation bulundu, seç
        setSelectedId(conversationId);
      } else {
        // Conversation bulunamadı, fetch et (yeni oluşturulan conversation olabilir)
        fetchConversation();
      }

      function fetchConversation() {
        const fetchConv = async () => {
          try {
            // API route kullan (server-side, RLS bypass)
            const response = await fetch(`/api/conversations/${conversationId}`, {
              cache: 'no-store',
            });

            if (!response.ok) {
              // 404 hatası normal (conversation henüz görünmüyor olabilir - RLS nedeniyle)
              // Conversation zaten oluşturulmuş, sadece henüz görünmüyor
              // Minimal conversation objesi oluştur ve state'e ekle
              if (response.status === 404 && sellerId && conversationId) {
                console.log('Conversation not found yet (RLS), creating minimal conversation object');
                
                // Seller ve listing bilgilerini fetch et
                try {
                  const supabase = createSupabaseBrowserClient();
                  
                  // Seller bilgilerini fetch et
                  const { data: sellerProfile } = await supabase
                    .from('profiles')
                    .select('id, username, display_name, avatar_url')
                    .eq('id', sellerId)
                    .single();
                  
                  // Listing bilgilerini fetch et (eğer listingId varsa)
                  let listingData: any = null;
                  if (listingId) {
                    const { data: listing } = await supabase
                      .from('listings')
                      .select('id, title, thumbnail_url, images, seller_id')
                      .eq('id', listingId)
                      .single();
                    listingData = listing;
                  }
                  
                  // Type assertion for sellerProfile
                  const seller = sellerProfile as { username?: string; display_name?: string | null; avatar_url?: string | null } | null;
                  
                  // Minimal conversation objesi oluştur (sadece chat açılabilmesi için)
                  const minimalConversation: Conversation = {
                    id: conversationId,
                    user1_id: currentUserId,
                    user2_id: sellerId,
                    listing_id: listingId || null,
                    updated_at: new Date().toISOString(),
                    messages: [],
                    user2: seller ? {
                      id: sellerId,
                      username: seller.username || 'user',
                      display_name: seller.display_name || seller.username || 'User',
                      avatar_url: seller.avatar_url || null,
                    } : {
                      id: sellerId,
                      username: 'user',
                      display_name: 'User',
                      avatar_url: null,
                    },
                    listing: listingData ? {
                      id: listingData.id,
                      title: listingData.title,
                      thumbnail_url: listingData.thumbnail_url,
                      images: listingData.images,
                      seller_id: listingData.seller_id,
                    } : undefined,
                  };

                  // Conversation'ı state'e ekle
                  setConversations(prev => {
                    if (prev.find(c => c.id === conversationId)) {
                      return prev;
                    }
                    return [...prev, minimalConversation];
                  });

                  // Seç
                  setSelectedId(conversationId);
                  return;
                } catch (sellerErr) {
                  console.error('Error fetching seller profile or listing:', sellerErr);
                  // Seller ve listing bilgisi olmadan da devam et - minimal conversation oluştur
                  if (!conversationId) return;
                  
                  const minimalConversation: Conversation = {
                    id: conversationId,
                    user1_id: currentUserId,
                    user2_id: sellerId,
                    listing_id: listingId || null,
                    updated_at: new Date().toISOString(),
                    messages: [],
                    user2: {
                      id: sellerId,
                      username: 'user',
                      display_name: 'User',
                      avatar_url: null,
                    },
                    listing: listingId ? {
                      id: listingId,
                      title: '',
                      thumbnail_url: null,
                      images: null,
                      seller_id: sellerId,
                    } : undefined,
                  };

                  setConversations(prev => {
                    if (prev.find(c => c.id === conversationId)) {
                      return prev;
                    }
                    return [...prev, minimalConversation];
                  });

                  setSelectedId(conversationId);
                  return;
                }
              }
              console.error('Failed to fetch conversation:', response.status);
              return;
            }

            const convData = await response.json();

            if (!convData || !convData.id) {
              console.error('Invalid conversation data');
              return;
            }

            // Type assertion - API'den gelen data'yı Conversation tipine cast et
            const conversation = convData as any as Conversation;

            // Kullanıcının bu conversation'a erişimi var mı kontrol et
            if (conversation.user1_id !== currentUserId && conversation.user2_id !== currentUserId) {
              console.error('User does not have access to this conversation');
              return;
            }

            // Conversation'ı state'e ekle
            setConversations(prev => {
              // Zaten varsa ekleme
              if (prev.find(c => c.id === conversationId)) {
                return prev;
              }
              return [...prev, conversation];
            });

            // Seç
            if (conversationId) {
              setSelectedId(conversationId);
            }
          } catch (err) {
            console.error('Error fetching conversation:', err);
          }
        };

        fetchConv();
      }
    }
  }, [searchParams, conversations, selectedId, currentUserId, isMobile, router]);

  // Seçili conversation değiştiğinde, eğer o conversation mevcut tab'da yoksa tab'ı değiştir
  // Ama sadece conversation bulunamazsa, yoksa kullanıcı tab'ı kontrol etsin
  useEffect(() => {
    if (!selectedId) return;

    // conversationsWithDetails'dan seçili conversation'ı bul
    const selectedConv = conversationsWithDetails.find(c => c.id === selectedId);
    if (!selectedConv) return;

    // Conversation'ın hangi tab'da olması gerektiğini belirle
    const firstMessage = selectedConv.messages?.[0];
    const shouldBeInSent = firstMessage 
      ? firstMessage.sender_id === currentUserId
      : selectedConv.user1_id === currentUserId;

    // Mevcut tab'da bu conversation var mı kontrol et
    const conversationsToShow = activeTab === 'sent' 
      ? sentConversations 
      : (isMobile ? receivedOnMyListings : receivedConversations);
    
    const isInCurrentTab = conversationsToShow.some(c => c.id === selectedId);
    
    // Eğer seçili conversation mevcut tab'da yoksa ve tab değişmesi gerekiyorsa, tab'ı değiştir
    if (!isInCurrentTab) {
      if (shouldBeInSent && activeTab !== 'sent') {
        setActiveTab('sent');
      } else if (!shouldBeInSent && activeTab !== 'received') {
        setActiveTab('received');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, currentUserId]);

  // Desktop'ta ilk konuşmayı otomatik seç (query parameter yoksa)
  useEffect(() => {
    if (!isDesktop) return;
    
    const conversationId = searchParams.get('conversation');
    if (conversationId) return; // Query parameter varsa bu effect'i atla
    
    const conversationsToShow = activeTab === 'sent' 
      ? sentConversations 
      : receivedConversations;
    
    // Eğer seçili konuşma yeni tab'da varsa, seçili kalsın
    if (selectedId && conversationsToShow.find(c => c.id === selectedId)) {
      return; // Seçili conversation bu tab'da, değiştirme
    }
    
    // Eğer seçili konuşma yeni tab'da yoksa, ilk konuşmayı seç
    if (conversationsToShow.length > 0) {
      setSelectedId(conversationsToShow[0].id);
    } else {
      setSelectedId(undefined);
    }
  }, [isDesktop, selectedId, activeTab, sentConversations, receivedConversations, searchParams]);

  // Sohbet silme fonksiyonu (soft delete - sadece kendi görünümünden kaldırır)
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Konuşmayı bul
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return;
      }

      // Kullanıcının user1 mi user2 mi olduğunu belirle
      const isUser1 = conversation.user1_id === currentUserId;
      
      // Kullanıcının bu konuşmaya erişimi olduğunu doğrula
      if (conversation.user1_id !== currentUserId && conversation.user2_id !== currentUserId) {
        alert('You do not have permission to delete this conversation.');
        return;
      }

      console.log('Deleting conversation:', { conversationId, isUser1, currentUserId, user1_id: conversation.user1_id, user2_id: conversation.user2_id });
      
      // Use RPC function to hide conversation (bypasses RLS policy issues)
      const { data, error } = await (supabase.rpc as any)('hide_conversation', {
        p_conversation_id: conversationId,
        p_user_id: currentUserId
      });

      if (error) {
        console.error('Delete conversation error:', error);
        const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
        alert(`Failed to delete conversation: ${errorMessage}`);
        return;
      }

      // Update successful - remove from state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Eğer silinen konuşma seçiliyse, seçimi temizle
      if (selectedId === conversationId) {
        setSelectedId(undefined);
      }
    } catch (err) {
      console.error('Unexpected error deleting conversation:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-50 xl:flex-row">
      {/* Sol Panel - Konuşma Listesi (Mobilde: selectedId varsa gizle) */}
      <div className={`flex flex-col overflow-hidden border-r border-zinc-200 bg-white xl:w-96 xl:flex-shrink-0 ${isMobile && selectedId ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-4 py-3.5">
          <h1 className="text-lg font-bold text-zinc-900">Messages</h1>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight">Manage your conversations</p>
        </div>

        {/* Mobil: Tab Butonları */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 xl:hidden">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition relative ${
              activeTab === 'sent'
                ? 'text-emerald-700'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            My Messages
            {activeTab === 'sent' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition relative ${
              activeTab === 'received'
                ? 'text-emerald-700'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Received
            {activeTab === 'received' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}
          </button>
        </div>

        {/* PC: Tab Butonları */}
        <div className="hidden border-b border-zinc-200 bg-zinc-50/50 xl:flex">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold transition relative ${
              activeTab === 'received'
                ? 'text-emerald-700 bg-white'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
            }`}
          >
            Received Messages
            {activeTab === 'received' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold transition relative ${
              activeTab === 'sent'
                ? 'text-emerald-700 bg-white'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
            }`}
          >
            My Messages
            {activeTab === 'sent' && (
              <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}
          </button>
        </div>

        {/* Konuşma Listesi */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {(() => {
            // Mobilde: activeTab'a göre göster
            // PC'de: activeTab'a göre göster
            const conversationsToShow = activeTab === 'sent' 
              ? sentConversations 
              : (isMobile ? receivedOnMyListings : receivedConversations);

            if (conversationsToShow.length === 0) {
              return (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <MessageCircle className="mx-auto h-12 w-12 text-zinc-400" />
                    <p className="mt-4 text-sm font-medium text-zinc-600">
                      {activeTab === 'sent' 
                        ? "No messages sent yet"
                        : "No messages received yet"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Start a conversation to see messages here
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="divide-y divide-zinc-100">
                {conversationsToShow.map((conversation) => {
                  const handleClick = (e: React.MouseEvent) => {
                    if (!isDesktop) {
                      return; // Mobilde Link çalışacak
                    }
                    e.preventDefault();
                    
                    // Sadece conversation'ı seç - tab değiştirme, kullanıcı tab'ı kontrol etsin
                    setSelectedId(conversation.id);
                  };

                  const content = (
                    <div
                      className={`relative block px-4 py-4 transition group ${
                        isDesktop ? 'cursor-pointer' : ''
                      } ${
                        selectedId === conversation.id && isDesktop
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 shadow-sm' 
                          : isDesktop ? 'hover:bg-zinc-50/80' : ''
                      }`}
                      onClick={isDesktop ? handleClick : undefined}
                    >
                      {/* Silme Butonu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteConversation(conversation.id);
                        }}
                        className="absolute right-2 top-2 z-20 rounded-full p-1.5 text-zinc-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        aria-label="Delete conversation"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {conversation.otherUser?.avatar_url ? (
                          <img
                            src={conversation.otherUser.avatar_url}
                            alt={conversation.otherUser.display_name || conversation.otherUser.username}
                            className="h-12 w-12 rounded-full object-cover flex-shrink-0 border border-zinc-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd] flex-shrink-0 border border-zinc-200">
                            <span className="text-lg font-semibold text-white">
                              {(conversation.otherUser?.display_name || conversation.otherUser?.username)?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-8">
                          {/* İsim ve Zaman */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-zinc-900 truncate text-sm">
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
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {conversation.listing.title}
                            </p>
                          )}

                          {/* Son Mesaj */}
                          {conversation.lastMessage && (
                            <div className="mt-1.5">
                              <p className="text-sm truncate text-zinc-600">
                                {conversation.lastMessage.sender_id === currentUserId && (
                                  <span className="text-zinc-500">You: </span>
                                )}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Ürün Resmi (varsa) */}
                        {conversation.listing && (conversation.listing.thumbnail_url || conversation.listing.images?.[0]) && (
                          <img
                            src={conversation.listing.thumbnail_url || conversation.listing.images?.[0] || ''}
                            alt={conversation.listing.title}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  );

                  if (isMobile) {
                    return (
                      <div 
                        key={conversation.id}
                        onClick={() => setSelectedId(conversation.id)}
                        className="cursor-pointer"
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <div key={conversation.id}>
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Sağ Panel - Chat (PC'de: xl: 1280px+, Mobilde: selectedId varsa göster) */}
      <div className={`${isMobile && !selectedId ? 'hidden' : ''} flex-1 overflow-hidden xl:flex xl:flex-col xl:bg-zinc-50`}>
        {selectedId ? (() => {
          // Seçili conversation'ı bul - önce conversationsWithDetails'da, yoksa conversations'da ara
          let selectedConv = conversationsWithDetails.find(c => c.id === selectedId);
          if (!selectedConv) {
            selectedConv = conversations.find(c => c.id === selectedId) as any;
          }
          if (!selectedConv) return null;
          
          // Conversation data'sını hazırla
          const convData = {
            id: selectedConv.id,
            user1_id: selectedConv.user1_id,
            user2_id: selectedConv.user2_id,
            listing_id: selectedConv.listing_id,
            listing: selectedConv.listing,
            user1: selectedConv.user1,
            user2: selectedConv.user2,
          };
          
          // Messages'ı hazırla (sadece conversation'daki mesajlar)
          const convMessages = selectedConv.messages?.map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: selectedConv.user1_id === msg.sender_id ? selectedConv.user2_id : selectedConv.user1_id,
            content: msg.content,
            is_read: msg.is_read,
            created_at: msg.created_at,
          })) || [];
          
          return (
            <MessagesChatView 
              key={selectedId}
              conversationId={selectedId}
              currentUserId={currentUserId}
              initialConversation={convData}
              initialMessages={convMessages}
              onBack={isMobile ? () => {
                // Mobilde direkt messages sayfasına git - tek seferde
                window.location.href = '/messages';
              } : undefined}
            />
          );
        })() : (
          <div className="flex h-full items-center justify-center overflow-hidden bg-zinc-50">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-3 text-xs text-zinc-400">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

