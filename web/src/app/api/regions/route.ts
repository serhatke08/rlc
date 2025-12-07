import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId');

    const supabase = await createSupabaseServerClient();
    
    let query = supabase
      .from('regions')
      .select('id, name, country_id, code')
      .order('name', { ascending: true })
      .limit(200);

    // If countryId is provided, filter by it
    if (countryId) {
      query = query.eq('country_id', countryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching regions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch regions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Unexpected error in regions API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

