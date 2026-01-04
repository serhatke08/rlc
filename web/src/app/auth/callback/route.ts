import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Email confirmation callback handler
 * Supabase email confirmation link'inden sonra bu sayfaya yönlendirilir
 * 
 * URL formatı: /auth/callback?token=xxx&type=signup
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  
  // Supabase client oluştur
  const supabase = await createSupabaseServerClient();
  
  // Email confirmation token'ını doğrula
  if (token && type === 'signup') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup',
    });
    
    if (error) {
      // Hata durumunda login sayfasına yönlendir
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }
    
    // Başarılı - account sayfasına yönlendir
    return NextResponse.redirect(new URL('/account', requestUrl.origin));
  }
  
  // Token yoksa veya geçersizse login sayfasına yönlendir
  return NextResponse.redirect(
    new URL('/auth/login?error=Invalid confirmation link', requestUrl.origin)
  );
}

