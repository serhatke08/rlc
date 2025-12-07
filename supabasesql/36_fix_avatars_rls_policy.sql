-- ============================================
-- AVATARS BUCKET RLS POLİTİKALARINI DÜZELT
-- ============================================
-- Storage upload hatası için avatars bucket RLS politikalarını güncelle
-- Hata: "new row violates row-level security policy"

-- ============================================
-- 1. MEVCUT POLİTİKALARI TEMİZLE
-- ============================================

DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

-- ============================================
-- 2. YENİ RLS POLİTİKALARI OLUŞTUR
-- ============================================

-- 1. Herkes avatar'ları görebilir (public)
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatars');

-- 2. Kullanıcılar kendi avatar'larını yükleyebilir
-- Dosya yolu formatları:
-- - {user_id}/avatar.jpg
-- - {user_id}/filename.ext
-- - {user_id}-filename.ext
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Dosya yolu direkt {user_id}/... ile başlıyorsa (en güvenilir)
      name LIKE auth.uid()::text || '/%'
      OR
      -- Dosya yolu {user_id}-... formatında ise
      name LIKE auth.uid()::text || '-%'
      OR
      -- Dosya yolu sadece {user_id} ile başlıyorsa (fallback)
      split_part(name, '/', 1) = auth.uid()::text
      OR
      -- Dosya yolu {user_id}/... formatında ise (storage.foldername ile)
      (array_length(storage.foldername(name), 1) > 0 AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

-- 3. Kullanıcılar kendi avatar'larını güncelleyebilir
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '-%'
      OR split_part(name, '/', 1) = auth.uid()::text
      OR (array_length(storage.foldername(name), 1) > 0 AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

-- 4. Kullanıcılar kendi avatar'larını silebilir
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '-%'
      OR split_part(name, '/', 1) = auth.uid()::text
      OR (array_length(storage.foldername(name), 1) > 0 AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

-- ============================================
-- 3. BUCKET RLS'Yİ AKTİF ET (EĞER DEĞİLSE)
-- ============================================

-- Storage.objects tablosunda RLS'nin aktif olduğundan emin ol
-- (Genellikle Supabase tarafından otomatik aktif edilir)

-- ============================================
-- 4. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Avatars bucket RLS politikaları güncellendi!';
  RAISE NOTICE '✅ Artık kullanıcılar kendi avatar dosyalarını yükleyebilir';
  RAISE NOTICE '✅ Desteklenen dosya yolu formatları:';
  RAISE NOTICE '   - {user_id}/avatar.jpg';
  RAISE NOTICE '   - {user_id}/filename.ext';
  RAISE NOTICE '   - {user_id}-filename.ext';
END $$;

