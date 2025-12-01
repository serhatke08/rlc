-- ============================================
-- FIX LISTINGS METADATA - ADD listing_type
-- ============================================
-- Bu script, mevcut ilanların metadata'sına listing_type ekler
-- Eğer metadata yoksa veya listing_type yoksa, varsayılan olarak 'free' ekler

-- ============================================
-- 1. Metadata'sı NULL veya boş olan ilanları güncelle
-- ============================================
UPDATE listings
SET metadata = jsonb_build_object('listing_type', 'free', 'is_freecycle', true)
WHERE metadata IS NULL 
   OR metadata = '{}'::jsonb
   OR metadata->>'listing_type' IS NULL;

-- ============================================
-- 2. Metadata'sı var ama listing_type yoksa ekle
-- ============================================
UPDATE listings
SET metadata = metadata || jsonb_build_object('listing_type', 'free', 'is_freecycle', true)
WHERE metadata IS NOT NULL 
  AND metadata != '{}'::jsonb
  AND (metadata->>'listing_type' IS NULL OR metadata->>'listing_type' = '');

-- ============================================
-- 3. Debug: Hangi ilanlar güncellendi?
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
-- 4. Tüm aktif ilanların listing_type'ını göster
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

