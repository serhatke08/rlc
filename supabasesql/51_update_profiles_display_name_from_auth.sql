-- ============================================
-- PROFILES TABLOSUNDAKI DISPLAY_NAME'LERI
-- AUTH.USERS TABLOSUNDAKI USER_METADATA'DAN GÜNCELLE
-- ============================================
-- Bu script, profiles tablosundaki display_name'leri
-- auth.users tablosundaki raw_user_meta_data'dan günceller
-- Sadece display_name'i NULL, 'user' veya 'User' olan kayıtları günceller

CREATE OR REPLACE FUNCTION update_profiles_display_name_from_auth()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- auth.users'dan display_name'i al ve profiles tablosunu güncelle
  -- Hem 'display_name' hem de 'displayName' formatlarını kontrol et
  WITH auth_display_names AS (
    SELECT 
      au.id,
      TRIM(COALESCE(
        au.raw_user_meta_data->>'display_name',
        au.raw_user_meta_data->>'displayName',
        NULL
      )) as auth_display_name
    FROM auth.users au
    WHERE COALESCE(
      au.raw_user_meta_data->>'display_name',
      au.raw_user_meta_data->>'displayName',
      NULL
    ) IS NOT NULL
    AND TRIM(COALESCE(
      au.raw_user_meta_data->>'display_name',
      au.raw_user_meta_data->>'displayName',
      ''
    )) != ''
  )
  UPDATE public.profiles p
  SET 
    display_name = adn.auth_display_name,
    updated_at = NOW()
  FROM auth_display_names adn
  WHERE p.id = adn.id
  AND (
    p.display_name IS NULL 
    OR LOWER(TRIM(p.display_name)) = 'user'
  );
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$;

-- Fonksiyonu çalıştır ve sonucu göster
DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  SELECT update_profiles_display_name_from_auth() INTO v_updated_count;
  RAISE NOTICE '✅ Güncellenen profil sayısı: %', v_updated_count;
END $$;

-- Fonksiyon izinleri
REVOKE ALL ON FUNCTION update_profiles_display_name_from_auth() FROM PUBLIC;

-- Fonksiyonun başarıyla oluşturulduğunu doğrula
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_profiles_display_name_from_auth'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE '✅ update_profiles_display_name_from_auth function created successfully!';
  ELSE
    RAISE EXCEPTION 'Failed to create update_profiles_display_name_from_auth function';
  END IF;
END $$;

