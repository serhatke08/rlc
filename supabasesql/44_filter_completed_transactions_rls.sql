-- ============================================
-- FILTER COMPLETED TRANSACTIONS FROM LISTINGS
-- ============================================
-- RLS policy ile completed transactions'da olan listing'leri filtrele
-- Bu sayede hiçbir kullanıcının given/received'ındaki ürünler görünmez

-- ============================================
-- 1. MEVCUT POLICY'YI GÜNCELLE
-- ============================================

-- Mevcut "Listings are viewable by everyone" policy'sini kaldır
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;

-- Yeni policy: Completed transactions'da olan listing'leri filtrele
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (
    -- Aktif listing'ler veya kullanıcının kendi listing'leri
    (status = 'active' OR seller_id = auth.uid())
    -- VE completed transactions'da olmayan listing'ler
    AND NOT EXISTS (
      SELECT 1 
      FROM item_transactions
      WHERE item_transactions.listing_id = listings.id
      AND item_transactions.status = 'completed'
    )
  );

-- ============================================
-- 2. INDEX EKLE (PERFORMANS İÇİN)
-- ============================================

-- item_transactions tablosunda listing_id ve status için index
CREATE INDEX IF NOT EXISTS idx_item_transactions_listing_status 
ON item_transactions(listing_id, status)
WHERE status = 'completed';

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Test: Completed transactions'da olan listing'lerin sayısı
SELECT 
  COUNT(DISTINCT listing_id) as completed_listing_count
FROM item_transactions
WHERE status = 'completed';

-- Test: Aktif listing'lerin sayısı
SELECT 
  COUNT(*) as active_listing_count
FROM listings
WHERE status = 'active';

-- Test: Completed transactions'da olan aktif listing'lerin sayısı
SELECT 
  COUNT(*) as active_completed_listing_count
FROM listings
WHERE status = 'active'
AND EXISTS (
  SELECT 1 
  FROM item_transactions
  WHERE item_transactions.listing_id = listings.id
  AND item_transactions.status = 'completed'
);

-- ============================================
-- END
-- ============================================

