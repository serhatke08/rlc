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
    const { listingId, buyerId, type } = body;

    if (!listingId || !buyerId) {
      return NextResponse.json(
        { error: 'listingId and buyerId are required' },
        { status: 400 }
      );
    }

    // Kendi kendine anlaşma göndermeyi engelle
    if (user.id === buyerId) {
      return NextResponse.json(
        { error: 'Cannot send agreement to yourself' },
        { status: 400 }
      );
    }

    // Listing'in kullanıcıya ait olduğunu kontrol et
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, seller_id, status')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only send agreements for your own listings' },
        { status: 403 }
      );
    }

    // Listing'in aktif olduğunu kontrol et
    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Can only send agreements for active listings' },
        { status: 400 }
      );
    }

    // Mevcut anlaşma var mı kontrol et
    const agreementType = type || 'verification_request';
    
    if (agreementType === 'verification_request') {
      // verification_requests tablosuna ekle
      const { data: existingRequest, error: checkError } = await supabase
        .from('verification_requests')
        .select('id, status')
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing request:', checkError);
        return NextResponse.json(
          { error: 'Failed to check existing agreement' },
          { status: 500 }
        );
      }

      if (existingRequest) {
        return NextResponse.json(
          { error: 'An agreement request already exists for this listing' },
          { status: 400 }
        );
      }

      // Yeni verification request oluştur
      const { data: newRequest, error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating verification request:', insertError);
        return NextResponse.json(
          { error: insertError.message || 'Failed to send agreement' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        agreementId: newRequest.id,
        type: 'verification_request'
      });
    } else if (agreementType === 'item_link') {
      // item_links tablosuna ekle
      const { data: existingLink, error: checkError } = await supabase
        .from('item_links')
        .select('id, status')
        .eq('listing_id', listingId)
        .eq('receiver_id', buyerId)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing link:', checkError);
        return NextResponse.json(
          { error: 'Failed to check existing agreement' },
          { status: 500 }
        );
      }

      if (existingLink) {
        return NextResponse.json(
          { error: 'An agreement request already exists for this listing' },
          { status: 400 }
        );
      }

      // Yeni item link oluştur
      const { data: newLink, error: insertError } = await supabase
        .from('item_links')
        .insert({
          listing_id: listingId,
          receiver_id: buyerId,
          sender_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating item link:', insertError);
        return NextResponse.json(
          { error: insertError.message || 'Failed to send agreement' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        agreementId: newLink.id,
        type: 'item_link'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid agreement type' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in send agreement API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

