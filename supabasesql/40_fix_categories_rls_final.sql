-- ============================================
-- FIX CATEGORIES RLS - FINAL FIX
-- ============================================
-- Kategorilerin çekilmemesi sorununu çözmek için
-- RLS politikalarını ve GRANT izinlerini düzelt
-- 
-- Bu dosya 39_fix_categories_and_regions_rls.sql'in
-- daha güvenilir bir versiyonudur
-- ============================================

-- ============================================
-- 1. PRODUCT_CATEGORIES RLS - HERKES GÖREBİLSİN
-- ============================================

-- Mevcut tüm politikaları temizle
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON product_categories;
DROP POLICY IF EXISTS "categories_select" ON product_categories;
DROP POLICY IF EXISTS "product_categories_select" ON product_categories;

-- RLS'yi etkinleştir
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Herkes tüm kategorileri görebilir (is_active kontrolü yok)
-- Client-side'da is_active filtresi yapılacak
CREATE POLICY "Categories are viewable by everyone" ON product_categories
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver (Supabase için kritik)
GRANT SELECT ON product_categories TO anon;
GRANT SELECT ON product_categories TO authenticated;
GRANT SELECT ON product_categories TO service_role;

-- ============================================
-- 2. PRODUCT_SUBCATEGORIES RLS
-- ============================================

-- Mevcut tüm politikaları temizle
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON product_subcategories;
DROP POLICY IF EXISTS "subcategories_select" ON product_subcategories;
DROP POLICY IF EXISTS "product_subcategories_select" ON product_subcategories;

-- RLS'yi etkinleştir
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;

-- Herkes tüm alt kategorileri görebilir
CREATE POLICY "Subcategories are viewable by everyone" ON product_subcategories
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver
GRANT SELECT ON product_subcategories TO anon;
GRANT SELECT ON product_subcategories TO authenticated;
GRANT SELECT ON product_subcategories TO service_role;

-- ============================================
-- 3. VERIFICATION - KATEGORİLERİ KONTROL ET
-- ============================================

-- Kategorilerin sayısını kontrol et
SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_categories,
  COUNT(*) FILTER (WHERE is_active = FALSE) as inactive_categories,
  COUNT(*) FILTER (WHERE is_active IS NULL) as null_active_categories
FROM product_categories;

-- İlk 10 kategoriyi göster
SELECT id, name, slug, is_active, order_index
FROM product_categories
ORDER BY order_index NULLS LAST, name
LIMIT 10;

-- RLS politikalarını kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('product_categories', 'product_subcategories')
ORDER BY tablename, policyname;

-- ============================================
-- 4. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Product categories RLS politikaları güncellendi!';
  RAISE NOTICE '✅ Artık herkes tüm kategorileri görebilir';
  RAISE NOTICE '✅ GRANT SELECT izinleri verildi (anon, authenticated, service_role)';
  RAISE NOTICE '✅ Client-side''da is_active filtresi yapılacak';
END $$;

