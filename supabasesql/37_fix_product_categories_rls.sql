-- ============================================
-- FIX PRODUCT_CATEGORIES RLS POLICY
-- ============================================
-- Kategorilerin herkes tarafından görülebilmesi için RLS politikasını düzelt

-- ============================================
-- 1. MEVCUT POLİTİKAYI TEMİZLE
-- ============================================

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON product_categories;

-- ============================================
-- 2. YENİ RLS POLİTİKASI OLUŞTUR
-- ============================================
-- is_active = TRUE veya is_active IS NULL olan kategoriler görülebilir

CREATE POLICY "Categories are viewable by everyone" ON product_categories
  FOR SELECT USING (
    is_active = TRUE 
    OR is_active IS NULL
  );

-- ============================================
-- 3. PRODUCT_SUBCATEGORIES RLS POLİTİKASI
-- ============================================

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON product_subcategories;

CREATE POLICY "Subcategories are viewable by everyone" ON product_subcategories
  FOR SELECT USING (
    is_active = TRUE 
    OR is_active IS NULL
  );

-- ============================================
-- 4. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Product categories RLS politikaları güncellendi!';
  RAISE NOTICE '✅ Artık is_active = TRUE veya NULL olan kategoriler görülebilir';
END $$;

