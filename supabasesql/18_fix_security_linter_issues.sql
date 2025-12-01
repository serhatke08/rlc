-- ============================================
-- SECURITY LINTER FIXES
-- ============================================
-- Bu dosya Supabase Database Linter hatalarını düzeltir:
-- 1. Function Search Path Mutable (10 fonksiyon)
-- 2. RLS Disabled in Public (regions tablosu)
-- 3. Storage bucket RLS politikaları (profil fotoğrafı için)

-- ============================================
-- 1. FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================
-- Tüm fonksiyonlara SET search_path = public, extensions ekleniyor
-- Önce mevcut fonksiyonları DROP et (parametre adı değişiklikleri için)

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_cities_by_region(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(listing_id UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(p_topic_id UUID) CASCADE;
DROP FUNCTION IF EXISTS update_listing_favorite_count() CASCADE;
DROP FUNCTION IF EXISTS update_listing_comment_count() CASCADE;
DROP FUNCTION IF EXISTS update_category_listing_count() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS increment_listing_view(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_topic_view(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_topic_view(p_topic_id UUID) CASCADE;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- update_updated_at_column (profiles için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_updated_at_column (listings için - aynı isimde ama farklı kullanım)
-- Not: PostgreSQL'de aynı isimde iki fonksiyon olabilir (overloading)
-- Ama burada aynı fonksiyon, sadece search_path ekliyoruz

-- get_cities_by_region
CREATE OR REPLACE FUNCTION get_cities_by_region(p_region_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  country_code TEXT,
  order_index INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.country_code, c.order_index
  FROM cities c
  WHERE c.region_id = p_region_id
  ORDER BY c.order_index, c.name;
END;
$$;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  username_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Base username oluştur
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    'user_' || substr(NEW.id::text, 1, 8)
  ));
  
  -- Username unique olana kadar sayı ekle
  final_username := base_username;
  
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = final_username) INTO username_exists;
    EXIT WHEN NOT username_exists;
    counter := counter + 1;
    final_username := base_username || '_' || counter::text;
  END LOOP;
  
  -- Profil oluştur
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    reputation,
    total_posts,
    total_comments,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      final_username
    ),
    0,
    0,
    0,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda logla ama işlemi durdurma
    RAISE LOG 'Profil oluşturma hatası: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- increment_view_count (topics için - eğer varsa)
-- Not: Bu fonksiyon linter'da listelenmiş ama dosyalarda bulunamadı
-- Eğer yoksa oluşturulacak, varsa güncellenecek
CREATE OR REPLACE FUNCTION increment_view_count(p_topic_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE topics 
  SET view_count = view_count + 1 
  WHERE id = p_topic_id;
END;
$$;

-- update_listing_favorite_count
CREATE OR REPLACE FUNCTION update_listing_favorite_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET favorite_count = favorite_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_listing_comment_count
CREATE OR REPLACE FUNCTION update_listing_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET comment_count = comment_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET comment_count = comment_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_category_listing_count
CREATE OR REPLACE FUNCTION update_category_listing_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Yeni ilan eklendiğinde kategori sayısını artır
    IF NEW.category_id IS NOT NULL THEN
      UPDATE product_categories 
      SET listing_count = COALESCE(listing_count, 0) + 1 
      WHERE id = NEW.category_id;
    END IF;
    
    -- Alt kategori sayısını da artır
    IF NEW.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories 
      SET listing_count = COALESCE(listing_count, 0) + 1 
      WHERE id = NEW.subcategory_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- İlan silindiğinde kategori sayısını azalt
    IF OLD.category_id IS NOT NULL THEN
      UPDATE product_categories 
      SET listing_count = GREATEST(COALESCE(listing_count, 0) - 1, 0) 
      WHERE id = OLD.category_id;
    END IF;
    
    -- Alt kategori sayısını da azalt
    IF OLD.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories 
      SET listing_count = GREATEST(COALESCE(listing_count, 0) - 1, 0) 
      WHERE id = OLD.subcategory_id;
    END IF;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- generate_slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  slug_text TEXT;
BEGIN
  -- Türkçe karakterleri değiştir
  slug_text := lower(title);
  slug_text := translate(slug_text, 'çğıöşüÇĞIİÖŞÜ', 'cgiosuCGIIOSU');
  slug_text := regexp_replace(slug_text, '[^a-z0-9]+', '-', 'g');
  slug_text := trim(both '-' from slug_text);
  
  -- Rastgele sayı ekle (benzersizlik için)
  slug_text := slug_text || '-' || substr(md5(random()::text), 1, 8);
  
  RETURN slug_text;
END;
$$;

-- increment_listing_view
CREATE OR REPLACE FUNCTION increment_listing_view(listing_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE listings 
  SET view_count = view_count + 1 
  WHERE id = listing_uuid;
END;
$$;

-- increment_topic_view (topics için)
CREATE OR REPLACE FUNCTION increment_topic_view(p_topic_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE topics 
  SET view_count = view_count + 1 
  WHERE id = p_topic_id;
END;
$$;

-- update_conversation_timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. ENABLE RLS ON REGIONS TABLE
-- ============================================

-- RLS'yi aktif et
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Herkes regions tablosunu okuyabilir (public data)
CREATE POLICY "regions_select" ON regions
  FOR SELECT USING (true);

-- Sadece authenticated kullanıcılar yeni region ekleyebilir (admin için)
-- Not: Admin kontrolü uygulama seviyesinde yapılmalı
CREATE POLICY "regions_insert" ON regions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Sadece authenticated kullanıcılar region güncelleyebilir
CREATE POLICY "regions_update" ON regions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Sadece authenticated kullanıcılar region silebilir
CREATE POLICY "regions_delete" ON regions
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 3. FIX STORAGE BUCKET RLS POLICIES
-- ============================================
-- Profil fotoğrafı yükleme hatası için avatars bucket politikalarını güncelle

-- Mevcut avatars politikalarını temizle ve yeniden oluştur
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

-- 1. Herkes avatar'ları görebilir (public)
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 2. Kullanıcılar kendi avatar'larını yükleyebilir
-- Dosya yolu: {user_id}/{filename} veya sadece {filename} (user_id ile başlayan)
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Dosya yolu {user_id}/... formatında ise
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      -- Dosya yolu direkt {user_id}-... formatında ise
      name LIKE auth.uid()::text || '/%'
      OR
      -- Dosya yolu direkt {user_id}-... formatında ise (tire ile)
      name LIKE auth.uid()::text || '-%'
    )
  );

-- 3. Kullanıcılar kendi avatar'larını güncelleyebilir
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '-%'
    )
  );

-- 4. Kullanıcılar kendi avatar'larını silebilir
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '-%'
    )
  );

-- ============================================
-- SON
-- ============================================
-- Tüm güvenlik linter hataları düzeltildi:
-- ✅ Function Search Path Mutable (10 fonksiyon)
-- ✅ RLS Disabled in Public (regions tablosu)
-- ✅ Storage bucket RLS politikaları (avatars)

