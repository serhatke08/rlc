-- ============================================
-- FIX CATEGORIES AND REGIONS RLS - COMPLETE FIX
-- ============================================
-- Kategoriler ve regionlar için RLS politikalarını tamamen düzelt
-- Herkes tüm kategorileri ve regionları görebilsin

-- ============================================
-- 1. PRODUCT_CATEGORIES RLS - HERKES GÖREBİLSİN
-- ============================================

-- Mevcut politikayı temizle
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON product_categories;

-- RLS'yi kapat (public data için gerekli değil)
-- ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- VEYA RLS'yi açık tut ama herkes görebilsin
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Herkes tüm kategorileri görebilir (is_active kontrolü yok)
CREATE POLICY "Categories are viewable by everyone" ON product_categories
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver (Supabase için gerekli)
GRANT SELECT ON product_categories TO anon, authenticated;

-- ============================================
-- 2. PRODUCT_SUBCATEGORIES RLS
-- ============================================

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON product_subcategories;

ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone" ON product_subcategories
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver
GRANT SELECT ON product_subcategories TO anon, authenticated;

-- ============================================
-- 3. REGIONS RLS - HERKES GÖREBİLSİN
-- ============================================

DROP POLICY IF EXISTS "Anyone can view regions" ON regions;
DROP POLICY IF EXISTS "regions_select" ON regions;
DROP POLICY IF EXISTS "Regions are viewable by everyone" ON regions;

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view regions" ON regions
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver
GRANT SELECT ON regions TO anon, authenticated;

-- ============================================
-- 4. CITIES RLS - HERKES GÖREBİLSİN
-- ============================================

DROP POLICY IF EXISTS "Anyone can view cities" ON cities;
DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities" ON cities
  FOR SELECT USING (true);

-- Tablo seviyesinde izinleri ver
GRANT SELECT ON cities TO anon, authenticated;

-- ============================================
-- 5. COUNTRIES RLS - HERKES GÖREBİLSİN
-- ============================================

-- Countries tablosu için RLS kontrolü
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'countries' AND schemaname = 'public') THEN
    -- RLS'yi etkinleştir
    ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
    
    -- Mevcut politikaları temizle
    DROP POLICY IF EXISTS "Anyone can view countries" ON countries;
    DROP POLICY IF EXISTS "Countries are viewable by everyone" ON countries;
    
    -- Herkes ülkeleri görebilir
    CREATE POLICY "Anyone can view countries" ON countries
      FOR SELECT USING (true);
    
    -- Tablo seviyesinde izinleri ver
    GRANT SELECT ON countries TO anon, authenticated;
  END IF;
END $$;

-- ============================================
-- 6. VERIFICATION - KATEGORİLERİ KONTROL ET
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

-- ============================================
-- 7. BAŞARI MESAJI
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Product categories RLS politikaları güncellendi!';
  RAISE NOTICE '✅ Artık herkes tüm kategorileri görebilir';
  RAISE NOTICE '✅ Regions ve cities RLS politikaları da güncellendi';
  RAISE NOTICE '✅ Tüm tablolara GRANT SELECT izinleri verildi (anon, authenticated)';
END $$;

