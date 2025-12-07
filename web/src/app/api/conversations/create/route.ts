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

    return NextResponse.json({ conversationId });
  } catch (error: any) {
    console.error('Error in create conversation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

