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

    // Call RPC function to delete user account (deletes profile and all related data)
    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      console.error('Error deleting user account:', rpcError);
      return NextResponse.json(
        { error: rpcError.message || 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Note: Auth user deletion requires admin privileges
    // The RPC function deletes all profile data, but auth user remains
    // To fully delete auth user, you need to use Supabase Admin API or Edge Function
    // For now, we'll just delete the profile data and the user will be unable to login
    // since their profile doesn't exist

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error in delete account API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

