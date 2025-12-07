import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ countryId: string }> | { countryId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams?.countryId) {
      return NextResponse.json(
        { error: 'Country ID is missing' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('regions')
      .select('id, name, country_id, code')
      .eq('country_id', resolvedParams.countryId)
      .order('name', { ascending: true })
      .limit(100);

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

