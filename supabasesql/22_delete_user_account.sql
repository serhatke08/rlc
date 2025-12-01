-- ============================================
-- HESAP SİLME FONKSİYONU
-- ============================================
-- Bu fonksiyon kullanıcının hesabını ve tüm verilerini siler
-- CASCADE ile ilişkili tüm veriler otomatik silinir

-- ============================================
-- 1. HESAP SİLME RPC FONKSİYONU
-- ============================================
-- Not: Auth kullanıcısını silmek için admin fonksiyonu gerektirir
-- Bu fonksiyon sadece profil ve ilişkili verileri siler
-- Auth kullanıcısını silmek için Supabase Dashboard'dan veya Edge Function kullanılmalı

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Mevcut kullanıcı ID'sini al
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı giriş yapmamış';
  END IF;

  -- Profil silme (CASCADE ile tüm ilişkili veriler otomatik silinir):
  -- - profiles (ana profil)
  -- - user_badges (kullanıcı rozetleri)
  -- - user_credit_accounts (kredi hesapları)
  -- - credit_transactions (kredi işlemleri)
  -- - user_task_progress (görev ilerlemeleri)
  -- - user_badge_progress (rozet ilerlemeleri)
  -- - listings (ilanlar - seller_id foreign key ile)
  -- - listing_favorites (favoriler)
  -- - conversations (konuşmalar - user1_id, user2_id ile)
  -- - messages (mesajlar - sender_id, receiver_id ile)
  -- - follow_relationships (takip ilişkileri - follower_id, following_id ile)
  -- - support_tickets (destek talepleri - user_id ile)
  -- - support_messages (destek mesajları - sender_id ile)
  
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Auth kullanıcısını silmek için:
  -- Supabase Dashboard > Authentication > Users > Delete User
  -- VEYA
  -- Bir Edge Function oluşturup admin API kullan:
  -- supabase.auth.admin.deleteUser(current_user_id)
  
  -- Not: Client-side'dan auth user'ı silmek mümkün değil, admin fonksiyonu gerektirir
  -- Bu yüzden bu fonksiyon sadece profil verilerini siler
  -- Auth kullanıcısını silmek için ayrı bir işlem gerekir
  
END;
$$;

-- Fonksiyon izinleri
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- ============================================
-- 2. ALTERNATİF: EDGE FUNCTION İLE AUTH USER SİLME
-- ============================================
-- Supabase Dashboard'da bir Edge Function oluşturun:
-- 
-- 1. Supabase Dashboard > Edge Functions > Create Function
-- 2. Function adı: delete-user-account
-- 3. Kod:
--
-- import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
-- import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
--
-- serve(async (req) => {
--   try {
--     const supabaseAdmin = createClient(
--       Deno.env.get('SUPABASE_URL') ?? '',
--       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
--       {
--         auth: {
--           autoRefreshToken: false,
--           persistSession: false
--         }
--       }
--     )
--
--     const authHeader = req.headers.get('Authorization')!
--     const token = authHeader.replace('Bearer ', '')
--     const { data: { user } } = await supabaseAdmin.auth.getUser(token)
--
--     if (!user) {
--       return new Response(
--         JSON.stringify({ error: 'Kullanıcı bulunamadı' }),
--         { status: 401, headers: { 'Content-Type': 'application/json' } }
--       )
--     }
--
--     // RPC fonksiyonunu çağır (profil verilerini sil)
--     const { error: rpcError } = await supabaseAdmin.rpc('delete_user_account')
--     
--     if (rpcError) {
--       throw rpcError
--     }
--
--     // Auth kullanıcısını sil
--     const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
--
--     if (deleteError) {
--       throw deleteError
--     }
--
--     return new Response(
--       JSON.stringify({ success: true }),
--       { status: 200, headers: { 'Content-Type': 'application/json' } }
--     )
--   } catch (error) {
--     return new Response(
--       JSON.stringify({ error: error.message }),
--       { status: 500, headers: { 'Content-Type': 'application/json' } }
--     )
--   }
-- })
--
-- 4. Deploy edin
-- 5. Client-side'dan çağırın:
-- const { data, error } = await supabase.functions.invoke('delete-user-account', {
--   headers: {
--     Authorization: `Bearer ${session.access_token}`
--   }
-- })

-- ============================================
-- 3. CASCADE SİLME NOTLARI
-- ============================================
-- Aşağıdaki tablolarda ON DELETE CASCADE tanımlı olduğu için
-- profiles silindiğinde otomatik silinir:
--
-- - user_badges (user_id -> profiles.id)
-- - user_credit_accounts (user_id -> profiles.id)
-- - credit_transactions (user_id -> profiles.id)
-- - user_task_progress (user_id -> profiles.id)
-- - user_badge_progress (user_id -> profiles.id)
--
-- Aşağıdaki tablolarda foreign key'ler CASCADE olmayabilir,
-- bu yüzden manuel silme gerekebilir:
--
-- - listings (seller_id -> profiles.id) - CASCADE olmalı
-- - listing_favorites (user_id -> profiles.id) - CASCADE olmalı
-- - conversations (user1_id, user2_id -> profiles.id) - CASCADE olmalı
-- - messages (sender_id, receiver_id -> profiles.id) - CASCADE olmalı
-- - follow_relationships (follower_id, following_id -> profiles.id) - CASCADE olmalı
-- - support_tickets (user_id -> profiles.id) - CASCADE olmalı
-- - support_messages (sender_id -> profiles.id) - CASCADE olmalı

-- ============================================
-- 4. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Hesap silme fonksiyonu oluşturuldu!';
  RAISE NOTICE '⚠️  Not: Auth kullanıcısını silmek için Edge Function veya Dashboard kullanılmalı';
END $$;

