import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { sellerId, listingId } = body;

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId is required' }, { status: 400 });
    }

    // Kendi kendine mesaj göndermeyi engelle
    if (user.id === sellerId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Konuşmayı oluştur veya getir
    const { data: conversationId, error: convError } = await (supabase.rpc as any)(
      'get_or_create_conversation',
      {
        p_user1_id: user.id,
        p_user2_id: sellerId,
        p_listing_id: listingId || null
      }
    );

    if (convError) {
      console.error("Failed to create conversation:", convError);
      return NextResponse.json(
        { error: convError.message || 'Failed to create conversation' },
        { status: 500 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'No conversation ID returned' },
        { status: 500 }
      );
    }

    // Conversation bilgisini de fetch et ve döndür (fetch etmeye gerek kalmaması için)
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
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
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      // Conversation fetch edilemedi ama ID var, sadece ID döndür
      console.error('Failed to fetch conversation after creation:', fetchError);
      return NextResponse.json({ conversationId });
    }

    return NextResponse.json({ 
      conversationId,
      conversation: conversation as any
    });
  } catch (error: any) {
    console.error('Error in create conversation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

