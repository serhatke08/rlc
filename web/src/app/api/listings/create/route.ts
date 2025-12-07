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

    // Get form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const subcategoryId = formData.get('subcategoryId') as string;
    const listingType = formData.get('listingType') as string;
    const condition = formData.get('condition') as string;
    const regionId = formData.get('regionId') as string;
    const cityId = formData.get('cityId') as string;
    const cityName = formData.get('cityName') as string;
    const districtName = formData.get('districtName') as string;
    const countryId = formData.get('countryId') as string;

    // Get photos
    const photos: File[] = [];
    let photoIndex = 0;
    while (formData.has(`photo${photoIndex}`)) {
      const photo = formData.get(`photo${photoIndex}`) as File;
      if (photo) photos.push(photo);
      photoIndex++;
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: 'At least one photo required' }, { status: 400 });
    }

    // Upload photos
    const uploadedUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileExt = photo.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listings-images')
        .upload(fileName, photo, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        return NextResponse.json({ error: `Photo upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }

    // Create listing
    const { data: listing, error: listingError } = await (supabase
      .from('listings') as any)
      .insert({
        title: title.trim(),
        description: description.trim(),
        seller_id: user.id,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        listing_type: listingType,
        condition: condition,
        country_id: countryId || null,
        region_id: regionId || null,
        city_id: cityId || null,
        city_name: cityName || '',
        district_name: districtName || null,
        images: uploadedUrls,
        thumbnail_url: uploadedUrls[0],
        price: 0,
        currency: 'GBP',
        status: 'active',
      })
      .select()
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    return NextResponse.json({ id: listing.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

