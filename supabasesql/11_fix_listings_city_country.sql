-- ============================================
-- FIX LISTINGS CITY_ID AND REGION_ID
-- ============================================
-- Bu script, mevcut ilanların city_id ve region_id değerlerini
-- cities tablosundaki yeni EN country_code'lu şehirlerle eşleştirir

-- ============================================
-- 1. İlanların city_name'ine göre city_id güncelle
-- ============================================
-- Eğer ilanın city_name'i cities tablosundaki bir şehirle eşleşiyorsa,
-- city_id'yi güncelle ve region_id'yi de ekle

UPDATE listings l
SET 
  city_id = c.id,
  region_id = c.region_id
FROM cities c
WHERE 
  LOWER(TRIM(l.city_name)) = LOWER(TRIM(c.name))
  AND c.country_code = 'EN'
  AND (l.city_id IS NULL OR l.city_id != c.id OR l.region_id IS NULL);

-- ============================================
-- 2. Eğer city_id var ama region_id yoksa, city'den region_id al
-- ============================================
UPDATE listings l
SET region_id = c.region_id
FROM cities c
WHERE 
  l.city_id = c.id
  AND c.region_id IS NOT NULL
  AND l.region_id IS NULL;

-- ============================================
-- 3. Debug: Hangi ilanlar güncellendi?
-- ============================================
-- SELECT 
--   l.id,
--   l.title,
--   l.city_name,
--   l.city_id,
--   l.region_id,
--   c.name as city_table_name,
--   c.country_code,
--   c.region_id as city_region_id
-- FROM listings l
-- LEFT JOIN cities c ON l.city_id = c.id
-- WHERE l.status = 'active'
-- ORDER BY l.created_at DESC
-- LIMIT 20;

-- ============================================
-- END
-- ============================================

