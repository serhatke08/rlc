-- ============================================
-- ADD 'ownership' TO listing_type CHECK CONSTRAINT
-- ============================================
-- Sahiplendirme kategorisi için 'ownership' değerini ekle

-- ============================================
-- 1. Mevcut CHECK constraint'i kaldır
-- ============================================
ALTER TABLE listings 
DROP CONSTRAINT IF EXISTS listings_listing_type_check;

-- ============================================
-- 2. Yeni CHECK constraint ekle (ownership dahil)
-- ============================================
ALTER TABLE listings 
ADD CONSTRAINT listings_listing_type_check 
CHECK (listing_type IN ('free', 'exchange', 'sale', 'need', 'ownership'));

-- ============================================
-- 3. İstatistikler (ownership dahil)
-- ============================================
-- SELECT 
--   COUNT(*) as total_listings,
--   COUNT(CASE WHEN listing_type = 'free' THEN 1 END) as free_count,
--   COUNT(CASE WHEN listing_type = 'exchange' THEN 1 END) as exchange_count,
--   COUNT(CASE WHEN listing_type = 'sale' THEN 1 END) as sale_count,
--   COUNT(CASE WHEN listing_type = 'need' THEN 1 END) as need_count,
--   COUNT(CASE WHEN listing_type = 'ownership' THEN 1 END) as ownership_count,
--   COUNT(CASE WHEN listing_type IS NULL THEN 1 END) as null_count
-- FROM listings
-- WHERE status = 'active';

-- ============================================
-- END
-- ============================================

