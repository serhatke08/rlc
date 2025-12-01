-- Conversations tablosuna listing_id ekle
-- Her ürün için ayrı konuşma olabilmesi için

-- 1. listing_id sütunu ekle
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;

-- 2. Eski UNIQUE constraint'i kaldır
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_user1_id_user2_id_key;

-- 3. Yeni UNIQUE constraint ekle (user1, user2 VE listing_id)
-- Aynı iki kullanıcı farklı ürünler için farklı konuşmalar yapabilsin
ALTER TABLE conversations 
ADD CONSTRAINT conversations_unique_per_listing 
UNIQUE(user1_id, user2_id, listing_id);

-- 4. Index ekle performans için
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);

-- 5. Mevcut fonksiyonu güncelle
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID,
  p_listing_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Kendi kendine mesaj göndermeyi engelle
  IF p_user1_id = p_user2_id THEN
    RAISE EXCEPTION 'Kendi kendinize mesaj gönderemezsiniz';
  END IF;
  
  -- Mevcut konuşmayı ara (her iki yönden, listing_id ile)
  SELECT id INTO conversation_id
  FROM conversations 
  WHERE ((user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id))
     AND (listing_id = p_listing_id OR (listing_id IS NULL AND p_listing_id IS NULL));
  
  -- Konuşma yoksa oluştur
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id, listing_id)
    VALUES (p_user1_id, p_user2_id, p_listing_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Fonksiyon izinlerini ayarla
REVOKE ALL ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) TO authenticated, anon;

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations tablosu güncellendi!';
  RAISE NOTICE '✅ Her ürün için ayrı konuşma sistemi hazır!';
  RAISE NOTICE '✅ get_or_create_conversation fonksiyonu güncellendi!';
END $$;

