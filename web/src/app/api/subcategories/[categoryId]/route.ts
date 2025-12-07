import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> | { categoryId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams?.categoryId) {
      return NextResponse.json(
        { error: 'Category ID is missing' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('product_subcategories')
      .select('id, name, slug')
      .eq('category_id', resolvedParams.categoryId)
      .eq('is_active', true)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching subcategories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subcategories', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Unexpected error in subcategories API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

