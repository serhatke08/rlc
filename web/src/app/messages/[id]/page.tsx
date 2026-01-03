import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesChatView } from "@/components/messages/messages-chat-view";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface MessagesDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MessagesDetailPage({ params }: MessagesDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Conversation'ı fetch et - RLS ile çalışacak şekilde
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      user1_id,
      user2_id,
      listing_id,
      updated_at,
      listing:listings(id, title, thumbnail_url, images, seller_id),
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
    .eq("id", id)
    .limit(1);

  // Eğer RLS nedeniyle fetch edilemezse, API route kullan
  if (error || !conversations || conversations.length === 0) {
    // API route ile tekrar dene
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/conversations/${id}`, {
        cache: 'no-store',
        headers: {
          'Cookie': cookieHeader,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          const convData = data;
          
          // Conversation data'sını hazırla
          const conversationData = {
            id: convData.id,
            user1_id: convData.user1_id,
            user2_id: convData.user2_id,
            listing_id: convData.listing_id,
            listing: convData.listing,
            user1: convData.user1,
            user2: convData.user2,
          };

          // Messages'ı hazırla
          const messages = (convData.messages || []).map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: convData.user1_id === msg.sender_id ? convData.user2_id : convData.user1_id,
            content: msg.content,
            is_read: msg.is_read,
            created_at: msg.created_at,
          }));

          return (
            <div className="flex h-screen flex-col bg-zinc-50">
              <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-4 py-3">
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Messages
                </Link>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessagesChatView
                  conversationId={id}
                  currentUserId={user.id}
                  initialConversation={conversationData}
                  initialMessages={messages}
                />
              </div>
            </div>
          );
        }
      }
    } catch (apiErr) {
      console.error('API route fetch error:', apiErr);
    }
    
    notFound();
  }

  const convData = conversations[0] as any;

  // Kullanıcının erişimi var mı kontrol et
  if (convData.user1_id !== user.id && convData.user2_id !== user.id) {
    notFound();
  }

  // Conversation data'sını hazırla
  const conversationData = {
    id: convData.id,
    user1_id: convData.user1_id,
    user2_id: convData.user2_id,
    listing_id: convData.listing_id,
    listing: convData.listing,
    user1: convData.user1,
    user2: convData.user2,
  };

  // Messages'ı hazırla
  const messages = (convData.messages || []).map((msg: any) => ({
    id: msg.id,
    sender_id: msg.sender_id,
    receiver_id: convData.user1_id === msg.sender_id ? convData.user2_id : convData.user1_id,
    content: msg.content,
    is_read: msg.is_read,
    created_at: msg.created_at,
  }));

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* Mobile Header */}
      <div className="flex-shrink-0 border-b border-zinc-200 bg-white px-4 py-3">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Messages
        </Link>
      </div>

      {/* Chat View */}
      <div className="flex-1 overflow-hidden">
        <MessagesChatView
          conversationId={id}
          currentUserId={user.id}
          initialConversation={conversationData}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
