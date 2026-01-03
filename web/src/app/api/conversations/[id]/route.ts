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
    const { data: convData, error } = await supabase
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
      .or(`user1_id.eq."${user.id}",user2_id.eq."${user.id}"`)
      .single();

    if (error) {
      console.error('Failed to fetch conversation:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch conversation' },
        { status: 500 }
      );
    }

    if (!convData) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user has access (double check)
    if (convData.user1_id !== user.id && convData.user2_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(convData);
  } catch (error: any) {
    console.error('Error in get conversation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

