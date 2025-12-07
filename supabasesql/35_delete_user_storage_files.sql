-- ============================================
-- HESAP SİLİNDİĞİNDE TÜM KULLANICI DOSYALARINI SİLME
-- ============================================
-- Bu dosya, kullanıcı hesabı silindiğinde tüm bucket'lardaki
-- kullanıcı dosyalarının otomatik olarak silinmesini sağlar

-- ============================================
-- 1. HESAP SİLME FONKSİYONUNU GÜNCELLE
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_user_id UUID;
  user_id_text TEXT;
BEGIN
  -- Mevcut kullanıcı ID'sini al
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı giriş yapmamış';
  END IF;

  user_id_text := current_user_id::text;

  -- TÜM BUCKET'LARDAN KULLANICI DOSYALARINI SİL
  
  -- 1. avatars bucket - {user_id}/{filename} veya {user_id}-{filename}
  DELETE FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND (
      name LIKE user_id_text || '/%'
      OR name LIKE user_id_text || '-%'
      OR (storage.foldername(name))[1] = user_id_text
    );

  -- 2. profil-header bucket - {user_id}/{filename} veya {user_id}-{filename}
  DELETE FROM storage.objects
  WHERE bucket_id = 'profil-header'
    AND (
      name LIKE user_id_text || '/%'
      OR name LIKE user_id_text || '-%'
      OR (storage.foldername(name))[1] = user_id_text
    );

  -- 3. listings-images bucket - {user_id}/{listing_id}/{filename}
  -- Kullanıcının tüm ilan görsellerini sil
  DELETE FROM storage.objects
  WHERE bucket_id = 'listings-images'
    AND (storage.foldername(name))[1] = user_id_text;

  -- 4. banners bucket - {user_id}/{filename} (kullanıcı banner'ları varsa)
  DELETE FROM storage.objects
  WHERE bucket_id = 'banners'
    AND (
      name LIKE user_id_text || '/%'
      OR name LIKE user_id_text || '-%'
      OR (storage.foldername(name))[1] = user_id_text
    );

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
-- 2. PROFİL SİLİNDİĞİNDE OTOMATİK STORAGE SİLME TRİGGER'I
-- ============================================
-- Eğer delete_user_account() fonksiyonu çağrılmadan direkt profil silinirse
-- bu trigger devreye girer ve tüm storage dosyalarını da siler

CREATE OR REPLACE FUNCTION public.delete_user_storage_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  user_id_text TEXT;
BEGIN
  -- Eski profil ID'sini al (OLD.id)
  IF OLD.id IS NOT NULL THEN
    user_id_text := OLD.id::text;

    -- 1. avatars bucket - {user_id}/{filename} veya {user_id}-{filename}
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
      AND (
        name LIKE user_id_text || '/%'
        OR name LIKE user_id_text || '-%'
        OR (storage.foldername(name))[1] = user_id_text
      );

    -- 2. profil-header bucket - {user_id}/{filename} veya {user_id}-{filename}
    DELETE FROM storage.objects
    WHERE bucket_id = 'profil-header'
      AND (
        name LIKE user_id_text || '/%'
        OR name LIKE user_id_text || '-%'
        OR (storage.foldername(name))[1] = user_id_text
      );

    -- 3. listings-images bucket - {user_id}/{listing_id}/{filename}
    -- Kullanıcının tüm ilan görsellerini sil
    DELETE FROM storage.objects
    WHERE bucket_id = 'listings-images'
      AND (storage.foldername(name))[1] = user_id_text;

    -- 4. banners bucket - {user_id}/{filename} (kullanıcı banner'ları varsa)
    DELETE FROM storage.objects
    WHERE bucket_id = 'banners'
      AND (
        name LIKE user_id_text || '/%'
        OR name LIKE user_id_text || '-%'
        OR (storage.foldername(name))[1] = user_id_text
      );
  END IF;

  RETURN OLD;
END;
$$;

-- Trigger oluştur
DROP TRIGGER IF EXISTS delete_user_storage_on_profile_delete ON public.profiles;
CREATE TRIGGER delete_user_storage_on_profile_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_user_storage_on_profile_delete();

-- ============================================
-- 3. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tüm kullanıcı dosyaları silme özelliği eklendi!';
  RAISE NOTICE '✅ Profil silindiğinde şu bucket''lardaki dosyalar otomatik silinecek:';
  RAISE NOTICE '   - avatars';
  RAISE NOTICE '   - profil-header';
  RAISE NOTICE '   - listings-images (kullanıcının tüm ilan görselleri)';
  RAISE NOTICE '   - banners (kullanıcı banner''ları)';
END $$;

