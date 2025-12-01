-- ============================================
-- ADD METADATA COLUMN TO LISTINGS TABLE
-- ============================================
-- Eğer metadata kolonu yoksa ekle

-- ============================================
-- 1. Metadata kolonunu ekle (eğer yoksa)
-- ============================================
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- ============================================
-- 2. Mevcut ilanların metadata'sına listing_type ekle
-- ============================================
UPDATE listings
SET metadata = jsonb_build_object('listing_type', 'free', 'is_freecycle', true)
WHERE metadata IS NULL 
   OR metadata = '{}'::JSONB
   OR metadata->>'listing_type' IS NULL;

-- ============================================
-- 3. Metadata'sı var ama listing_type yoksa ekle
-- ============================================
UPDATE listings
SET metadata = metadata || jsonb_build_object('listing_type', 'free', 'is_freecycle', true)
WHERE metadata IS NOT NULL 
  AND metadata != '{}'::jsonb
  AND (metadata->>'listing_type' IS NULL OR metadata->>'listing_type' = '');

-- ============================================
-- 4. Index ekle (metadata için hızlı arama)
-- ============================================
-- JSONB için GIN index (tüm metadata için)
CREATE INDEX IF NOT EXISTS idx_listings_metadata 
ON listings USING GIN (metadata);

-- listing_type için btree index (text değer için)
CREATE INDEX IF NOT EXISTS idx_listings_metadata_listing_type 
ON listings ((metadata->>'listing_type'))
WHERE metadata->>'listing_type' IS NOT NULL;

-- ============================================
-- 5. Debug: Tüm aktif ilanların listing_type'ını göster
-- ============================================
-- SELECT 
--   id,
--   title,
--   metadata,
--   metadata->>'listing_type' as listing_type,
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
--   COUNT(CASE WHEN metadata->>'listing_type' = 'free' THEN 1 END) as free_count,
--   COUNT(CASE WHEN metadata->>'listing_type' = 'exchange' THEN 1 END) as exchange_count,
--   COUNT(CASE WHEN metadata->>'listing_type' = 'sale' THEN 1 END) as sale_count,
--   COUNT(CASE WHEN metadata->>'listing_type' = 'need' THEN 1 END) as need_count,
--   COUNT(CASE WHEN metadata->>'listing_type' IS NULL THEN 1 END) as null_count
-- FROM listings
-- WHERE status = 'active';

-- ============================================
-- END
-- ============================================

