-- ============================================
-- UPDATE LISTINGS STATUS FOR TRANSACTIONS
-- ============================================
-- item_transactions tablosuna kayıt eklendiğinde listings.status'u güncelle
-- seller_id ile eşleşiyorsa -> status = 'given'
-- buyer_id ile eşleşiyorsa -> status = 'received'

-- ============================================
-- 1. LISTINGS STATUS CHECK CONSTRAINT GÜNCELLE
-- ============================================

-- Önce mevcut constraint'i kaldır
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- Yeni constraint ekle (given ve received dahil)
ALTER TABLE listings 
ADD CONSTRAINT listings_status_check 
CHECK (status IN ('active', 'sold', 'deleted', 'expired', 'pending', 'given', 'received'));

-- ============================================
-- 2. TRIGGER FUNCTION OLUŞTUR
-- ============================================

CREATE OR REPLACE FUNCTION update_listing_status_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  listing_seller_id UUID;
BEGIN
  -- Sadece completed transaction'lar için işlem yap
  IF NEW.status = 'completed' THEN
    -- Listing'in seller_id'sini al
    SELECT seller_id INTO listing_seller_id
    FROM listings
    WHERE id = NEW.listing_id;
    
    -- Eğer transaction'daki seller_id, listing'in seller_id'si ile eşleşiyorsa -> 'given'
    IF NEW.seller_id = listing_seller_id THEN
      UPDATE listings
      SET status = 'given',
          updated_at = NOW()
      WHERE id = NEW.listing_id;
    
    -- Eğer transaction'daki buyer_id, listing'in seller_id'si ile eşleşmiyorsa -> 'received'
    -- (buyer_id farklı bir kullanıcı olduğu için)
    ELSIF NEW.buyer_id IS NOT NULL THEN
      UPDATE listings
      SET status = 'received',
          updated_at = NOW()
      WHERE id = NEW.listing_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER OLUŞTUR
-- ============================================

-- Mevcut trigger'ı kaldır (varsa)
DROP TRIGGER IF EXISTS trigger_update_listing_status_on_transaction ON item_transactions;

-- Yeni trigger'ı oluştur
CREATE TRIGGER trigger_update_listing_status_on_transaction
  AFTER INSERT ON item_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_listing_status_on_transaction();

-- ============================================
-- 4. MEVCUT TRANSACTION'LAR İÇİN GÜNCELLEME
-- ============================================
-- Eğer zaten item_transactions'da kayıtlar varsa, onları da güncelle

DO $$
DECLARE
  trans_record RECORD;
  listing_seller_id UUID;
BEGIN
  FOR trans_record IN 
    SELECT id, listing_id, seller_id, buyer_id, status
    FROM item_transactions
    WHERE status = 'completed'
  LOOP
    -- Listing'in seller_id'sini al
    SELECT seller_id INTO listing_seller_id
    FROM listings
    WHERE id = trans_record.listing_id;
    
    -- Eğer transaction'daki seller_id, listing'in seller_id'si ile eşleşiyorsa -> 'given'
    IF trans_record.seller_id = listing_seller_id THEN
      UPDATE listings
      SET status = 'given',
          updated_at = NOW()
      WHERE id = trans_record.listing_id;
    
    -- Eğer transaction'daki buyer_id varsa -> 'received'
    ELSIF trans_record.buyer_id IS NOT NULL THEN
      UPDATE listings
      SET status = 'received',
          updated_at = NOW()
      WHERE id = trans_record.listing_id;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- END
-- ============================================

