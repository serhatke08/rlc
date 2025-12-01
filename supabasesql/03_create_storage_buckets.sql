-- ============================================
-- SUPABASE STORAGE BUCKET'LARI
-- ============================================
-- Sahibinden/Letgo tarzı platform için gerekli storage bucket'ları
-- Bu dosya 01_create_listings_schema.sql'den SONRA çalıştırılmalıdır

-- ============================================
-- 1. LISTINGS-IMAGES BUCKET (EN ÖNEMLİ)
-- ============================================
-- İlan fotoğrafları için bucket
-- Her ilan için en az 1, maksimum 10 fotoğraf

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-images',
  'listings-images',
  true,
  10485760, -- 10MB per image (yeterli)
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

-- ============================================
-- 2. AVATARS BUCKET (Korunacak)
-- ============================================
-- Profil fotoğrafları için bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

-- ============================================
-- 3. PROFIL-HEADER BUCKET (Korunacak)
-- ============================================
-- Profil header görselleri için bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profil-header',
  'profil-header',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

-- ============================================
-- 4. BANNERS BUCKET (Korunacak)
-- ============================================
-- Reklam banner'ları için bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  52428800, -- 50MB (video banner'lar için)
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/x-msvideo'
  ];

-- ============================================
-- 5. CATEGORY-IMAGES BUCKET (Opsiyonel)
-- ============================================
-- Kategori görselleri için bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

-- ============================================
-- 6. RLS POLİTİKALARI - LISTINGS-IMAGES
-- ============================================

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "listings_images_select" ON storage.objects;
DROP POLICY IF EXISTS "listings_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "listings_images_update" ON storage.objects;
DROP POLICY IF EXISTS "listings_images_delete" ON storage.objects;

-- 1. Herkes ilan fotoğraflarını görebilir (public)
CREATE POLICY "listings_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings-images');

-- 2. Authenticated kullanıcılar ilan fotoğrafı yükleyebilir
-- Dosya yolu: {user_id}/{listing_id}/{filename}
CREATE POLICY "listings_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings-images' 
    AND auth.uid() IS NOT NULL
    -- Kullanıcı sadece kendi klasörüne yükleyebilir
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Kullanıcılar kendi ilan fotoğraflarını güncelleyebilir
CREATE POLICY "listings_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listings-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Kullanıcılar kendi ilan fotoğraflarını silebilir
CREATE POLICY "listings_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 7. RLS POLİTİKALARI - AVATARS
-- ============================================

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

-- 1. Herkes avatar'ları görebilir
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 2. Kullanıcılar kendi avatar'larını yükleyebilir
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Kullanıcılar kendi avatar'larını güncelleyebilir
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Kullanıcılar kendi avatar'larını silebilir
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 8. RLS POLİTİKALARI - PROFIL-HEADER
-- ============================================

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "profil_header_select" ON storage.objects;
DROP POLICY IF EXISTS "profil_header_insert" ON storage.objects;
DROP POLICY IF EXISTS "profil_header_update" ON storage.objects;
DROP POLICY IF EXISTS "profil_header_delete" ON storage.objects;

-- 1. Herkes profil header'ları görebilir
CREATE POLICY "profil_header_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profil-header');

-- 2. Kullanıcılar kendi profil header'larını yükleyebilir
CREATE POLICY "profil_header_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profil-header' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Kullanıcılar kendi profil header'larını güncelleyebilir
CREATE POLICY "profil_header_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profil-header' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Kullanıcılar kendi profil header'larını silebilir
CREATE POLICY "profil_header_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profil-header' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 9. RLS POLİTİKALARI - BANNERS
-- ============================================

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "banners_select" ON storage.objects;
DROP POLICY IF EXISTS "banners_insert" ON storage.objects;
DROP POLICY IF EXISTS "banners_update" ON storage.objects;
DROP POLICY IF EXISTS "banners_delete" ON storage.objects;

-- 1. Herkes banner'ları görebilir
CREATE POLICY "banners_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- 2. Authenticated kullanıcılar banner yükleyebilir
CREATE POLICY "banners_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' 
    AND auth.uid() IS NOT NULL
  );

-- 3. Kullanıcılar kendi banner'larını güncelleyebilir
CREATE POLICY "banners_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'banners' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Kullanıcılar kendi banner'larını silebilir
CREATE POLICY "banners_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 10. RLS POLİTİKALARI - CATEGORY-IMAGES
-- ============================================

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "category_images_select" ON storage.objects;
DROP POLICY IF EXISTS "category_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "category_images_update" ON storage.objects;
DROP POLICY IF EXISTS "category_images_delete" ON storage.objects;

-- 1. Herkes kategori görsellerini görebilir
CREATE POLICY "category_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');

-- 2. Authenticated kullanıcılar kategori görseli yükleyebilir (admin için)
-- Not: Admin kontrolü uygulama seviyesinde yapılmalı
CREATE POLICY "category_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'category-images' 
    AND auth.uid() IS NOT NULL
  );

-- 3. Authenticated kullanıcılar kategori görseli güncelleyebilir
CREATE POLICY "category_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'category-images' 
    AND auth.uid() IS NOT NULL
  );

-- 4. Authenticated kullanıcılar kategori görseli silebilir
CREATE POLICY "category_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'category-images' 
    AND auth.uid() IS NOT NULL
  );

-- ============================================
-- SON
-- ============================================

-- Bucket'lar başarıyla oluşturuldu!
-- Dosya yolu formatları:
-- 
-- listings-images: {user_id}/{listing_id}/{filename}
-- avatars: {user_id}/{filename}
-- profil-header: {user_id}/{filename}
-- banners: {user_id}/{filename}
-- category-images: {category_id}/{filename}

