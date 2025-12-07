-- ============================================
-- FIX PRODUCT_CATEGORIES RLS POLICY - PUBLIC ACCESS
-- ============================================
-- Kategorilerin herkes tarafından görülebilmesi için RLS politikasını düzelt
-- is_active kontrolünü kaldır - herkes tüm kategorileri görebilsin

-- ============================================
-- 1. MEVCUT POLİTİKAYI TEMİZLE
-- ============================================

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON product_categories;

-- ============================================
-- 2. YENİ RLS POLİTİKASI OLUŞTUR - HERKES GÖREBİLSİN
-- ============================================
-- is_active kontrolü yok - herkes tüm kategorileri görebilir
-- Client-side'da is_active filtresi yapılacak

CREATE POLICY "Categories are viewable by everyone" ON product_categories
  FOR SELECT USING (true);

-- ============================================
-- 3. PRODUCT_SUBCATEGORIES RLS POLİTİKASI
-- ============================================

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON product_subcategories;

CREATE POLICY "Subcategories are viewable by everyone" ON product_subcategories
  FOR SELECT USING (true);

-- ============================================
-- 4. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Product categories RLS politikaları güncellendi!';
  RAISE NOTICE '✅ Artık herkes tüm kategorileri görebilir (client-side filtreleme yapılacak)';
END $$;

