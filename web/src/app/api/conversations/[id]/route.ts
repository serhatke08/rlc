import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 16'da params Promise olabilir - await et
    const resolvedParams = params instanceof Promise ? await params : params;
    const conversationId = resolvedParams?.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch conversation with all related data
    // .single() yerine array kullan çünkü .or() ile birlikte sorun yaratabilir
    const { data: convDataArray, error } = await supabase
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
      .limit(1);

    if (error) {
      console.error('Failed to fetch conversation:', error);
      console.error('Conversation ID:', conversationId);
      console.error('User ID:', user.id);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch conversation', details: error },
        { status: 500 }
      );
    }

    if (!convDataArray || convDataArray.length === 0) {
      console.error('Conversation not found:', { conversationId, userId: user.id });
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const convData = convDataArray[0];

    // Type assertion - Supabase'den gelen data'yı any olarak cast et
    const conversation = convData as any;

    // Verify user has access (double check)
    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error('Error in get conversation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

