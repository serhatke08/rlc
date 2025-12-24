-- ============================================
-- ADD AVIF SUPPORT TO STORAGE BUCKETS
-- ============================================
-- Bu dosya listings-images bucket'ına AVIF format desteği ekler
-- Birden fazla kez çalıştırılabilir (idempotent)
-- ============================================

-- ============================================
-- 1. LISTINGS-IMAGES BUCKET - AVIF DESTEĞİ EKLE
-- ============================================

DO $$
DECLARE
  current_types TEXT[];
  has_avif BOOLEAN;
  bucket_exists BOOLEAN;
BEGIN
  -- Bucket var mı kontrol et
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'listings-images') INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Bucket yoksa oluştur (AVIF ile birlikte)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'listings-images',
      'listings-images',
      true,
      10485760, -- 10MB per image
      ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif'
      ]
    );
    RAISE NOTICE '✅ listings-images bucket oluşturuldu (AVIF desteği ile)';
  ELSE
    -- Bucket varsa mevcut mime type'ları al
    SELECT allowed_mime_types INTO current_types
    FROM storage.buckets
    WHERE id = 'listings-images';
    
    IF current_types IS NOT NULL THEN
      -- AVIF var mı kontrol et
      has_avif := 'image/avif' = ANY(current_types);
      
      IF NOT has_avif THEN
        -- AVIF'i ekle (array_append kullan)
        UPDATE storage.buckets
        SET allowed_mime_types = array_append(current_types, 'image/avif')
        WHERE id = 'listings-images';
        
        RAISE NOTICE '✅ AVIF formatı listings-images bucket''ına eklendi';
      ELSE
        RAISE NOTICE '✅ AVIF formatı zaten mevcut';
      END IF;
    ELSE
      -- Mime types NULL ise default değerlerle güncelle
      UPDATE storage.buckets
      SET allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif'
      ]
      WHERE id = 'listings-images';
      RAISE NOTICE '✅ Mime types güncellendi (AVIF dahil)';
    END IF;
  END IF;
END $$;

-- ============================================
-- 2. VERIFICATION - KONTROL ET
-- ============================================

-- Bucket'ın mime type'larını kontrol et
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  'image/avif' = ANY(allowed_mime_types) as has_avif_support
FROM storage.buckets
WHERE id = 'listings-images';

-- ============================================
-- 3. BAŞARI MESAJI
-- ============================================
DO $$
DECLARE
  bucket_types TEXT[];
BEGIN
  SELECT allowed_mime_types INTO bucket_types
  FROM storage.buckets 
  WHERE id = 'listings-images';
  
  IF bucket_types IS NOT NULL AND 'image/avif' = ANY(bucket_types) THEN
    RAISE NOTICE '✅ AVIF desteği başarıyla eklendi!';
    RAISE NOTICE '✅ listings-images bucket artık image/avif formatını kabul ediyor';
  ELSIF bucket_types IS NULL THEN
    RAISE NOTICE '⚠️ listings-images bucket bulunamadı';
  ELSE
    RAISE NOTICE '⚠️ AVIF desteği eklenemedi, lütfen kontrol edin';
  END IF;
END $$;
