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
    const { receiverId, content, listingId } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'receiverId and content are required' },
        { status: 400 }
      );
    }

    // Kendi kendine mesaj göndermeyi engelle
    if (user.id === receiverId) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      );
    }

    // İçerik kontrolü
    const sanitizedContent = content.trim();
    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Mesaj gönder
    const { data: messageId, error: sendError } = await (supabase.rpc as any)(
      'send_message',
      listingId 
        ? {
            p_sender_id: user.id,
            p_receiver_id: receiverId,
            p_content: sanitizedContent,
            p_listing_id: listingId
          }
        : {
            p_sender_id: user.id,
            p_receiver_id: receiverId,
            p_content: sanitizedContent
          }
    );

    if (sendError) {
      console.error("Failed to send message:", sendError);
      return NextResponse.json(
        { error: sendError.message || 'Failed to send message', details: sendError },
        { status: 500 }
      );
    }

    if (!messageId) {
      return NextResponse.json(
        { error: 'No message ID returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messageId, success: true });
  } catch (error: any) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

