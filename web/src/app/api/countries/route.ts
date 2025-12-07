import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, code, flag_emoji')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching countries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Unexpected error in countries API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

