-- ============================================
-- FIX REGIONS AND CITIES RLS POLICIES
-- ============================================
-- Regions ve cities tablolarına RLS politikaları ekle

-- ============================================
-- 1. REGIONS TABLE RLS
-- ============================================

-- RLS'yi etkinleştir
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "regions_select" ON regions;
DROP POLICY IF EXISTS "regions_insert" ON regions;
DROP POLICY IF EXISTS "regions_update" ON regions;
DROP POLICY IF EXISTS "regions_delete" ON regions;
DROP POLICY IF EXISTS "Anyone can view regions" ON regions;

-- Herkes regionları okuyabilir (public data)
CREATE POLICY "Anyone can view regions" ON regions
  FOR SELECT USING (true);

-- ============================================
-- 2. CITIES TABLE RLS
-- ============================================

-- RLS'yi etkinleştir (eğer değilse)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "Anyone can view cities" ON cities;

-- Herkes şehirleri okuyabilir (public data)
CREATE POLICY "Anyone can view cities" ON cities
  FOR SELECT USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Regions tablosunu kontrol et
SELECT 
  COUNT(*) as region_count,
  string_agg(name, ', ' ORDER BY order_index) as region_names
FROM regions
WHERE country_code = 'GB';

-- Cities tablosunu kontrol et
SELECT 
  r.name as region_name,
  COUNT(c.id) as city_count,
  string_agg(c.name, ', ' ORDER BY c.order_index) as cities
FROM regions r
LEFT JOIN cities c ON c.region_id = r.id
WHERE r.country_code = 'GB'
GROUP BY r.id, r.name, r.order_index
ORDER BY r.order_index;

-- ============================================
-- END
-- ============================================

