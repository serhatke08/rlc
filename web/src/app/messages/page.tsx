import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesLayout } from "@/components/messages/messages-layout";

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Kullanıcının konuşmalarını çek
  const { data: conversations } = await supabase
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
    .or(`user1_id.eq."${user.id}",user2_id.eq."${user.id}"`)
    .order("updated_at", { ascending: false });

  const conversationsData = (conversations || []) as any[];

  return (
    <MessagesLayout 
      initialConversations={conversationsData}
      currentUserId={user.id}
    />
  );
}

