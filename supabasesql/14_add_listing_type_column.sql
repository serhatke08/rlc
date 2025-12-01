-- ============================================
-- ADD listing_type COLUMN TO LISTINGS TABLE
-- ============================================
-- listing_type için ayrı bir TEXT kolonu ekle
-- Bu daha kolay sorgulama ve filtreleme sağlar

-- ============================================
-- 1. listing_type kolonunu ekle
-- ============================================
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS listing_type TEXT 
CHECK (listing_type IN ('free', 'exchange', 'sale', 'need'));

-- ============================================
-- 2. Mevcut ilanların listing_type'ını metadata'dan al
-- ============================================
UPDATE listings
SET listing_type = metadata->>'listing_type'
WHERE listing_type IS NULL 
  AND metadata IS NOT NULL 
  AND metadata->>'listing_type' IS NOT NULL;

-- ============================================
-- 3. Metadata'sı olmayan veya listing_type olmayan ilanları 'free' yap
-- ============================================
UPDATE listings
SET listing_type = 'free'
WHERE listing_type IS NULL;

-- ============================================
-- 4. Index ekle (hızlı filtreleme için)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_listing_type 
ON listings (listing_type)
WHERE listing_type IS NOT NULL;

-- ============================================
-- 5. Debug: Tüm aktif ilanların listing_type'ını göster
-- ============================================
-- SELECT 
--   id,
--   title,
--   listing_type,
--   metadata->>'listing_type' as metadata_listing_type,
--   created_at
-- FROM listings
-- WHERE status = 'active'
-- ORDER BY created_at DESC
-- LIMIT 20;

-- ============================================
-- 6. İstatistikler
-- ============================================
-- SELECT 
--   COUNT(*) as total_listings,
--   COUNT(CASE WHEN listing_type = 'free' THEN 1 END) as free_count,
--   COUNT(CASE WHEN listing_type = 'exchange' THEN 1 END) as exchange_count,
--   COUNT(CASE WHEN listing_type = 'sale' THEN 1 END) as sale_count,
--   COUNT(CASE WHEN listing_type = 'need' THEN 1 END) as need_count,
--   COUNT(CASE WHEN listing_type IS NULL THEN 1 END) as null_count
-- FROM listings
-- WHERE status = 'active';

-- ============================================
-- END
-- ============================================

