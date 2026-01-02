-- Conversations tablosuna hidden kolonları ekle
-- Kullanıcılar sohbeti sildiğinde sadece kendi görünümlerinden kaybolacak
-- Bu dosya birden fazla kez çalıştırılabilir (idempotent)

-- Hidden kolonlarını ekle (IF NOT EXISTS ile)
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS hidden_by_user1 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hidden_by_user2 BOOLEAN DEFAULT FALSE;

-- Eğer kolonlar NULL ise FALSE yap (eski veriler için)
UPDATE conversations 
SET hidden_by_user1 = FALSE 
WHERE hidden_by_user1 IS NULL;

UPDATE conversations 
SET hidden_by_user2 = FALSE 
WHERE hidden_by_user2 IS NULL;

-- Index ekle performans için (IF NOT EXISTS ile)
CREATE INDEX IF NOT EXISTS idx_conversations_hidden_user1 ON conversations(user1_id) WHERE hidden_by_user1 = FALSE;
CREATE INDEX IF NOT EXISTS idx_conversations_hidden_user2 ON conversations(user2_id) WHERE hidden_by_user2 = FALSE;

-- RLS policy'yi güncelle - hidden olanları filtrele
DROP POLICY IF EXISTS "conversations_select" ON conversations;
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    (auth.uid() = user1_id AND hidden_by_user1 = FALSE) OR 
    (auth.uid() = user2_id AND hidden_by_user2 = FALSE)
  );

-- UPDATE policy ekle - kullanıcılar kendi hidden durumlarını güncelleyebilsin
DROP POLICY IF EXISTS "conversations_update" ON conversations;
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- get_or_create_conversation fonksiyonunu güncelle
-- Hidden olan konuşmaları göz ardı et, yeni konuşma oluştur
-- Eğer mesaj gönderen kullanıcı (sender) sohbeti silmişse, yeni konuşma oluştur
-- NOT: send_message fonksiyonundan çağrıldığında sender bilgisi için send_message içinde kontrol yapılacak
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
  v_user1_sorted UUID;
  v_user2_sorted UUID;
BEGIN
  -- Kendi kendine mesaj göndermeyi engelle
  IF p_user1_id = p_user2_id THEN
    RAISE EXCEPTION 'Kendi kendinize mesaj gönderemezsiniz';
  END IF;
  
  -- Mevcut konuşmayı ara (her iki yönden, listing_id ile)
  -- Hidden kontrolü send_message içinde yapılacak
  SELECT id INTO conversation_id
  FROM conversations 
  WHERE ((user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id))
     AND (listing_id = p_listing_id OR (listing_id IS NULL AND p_listing_id IS NULL));
  
  -- Konuşma yoksa oluştur
  IF conversation_id IS NULL THEN
    -- User ID'leri sırala (küçük UUID user1)
    IF p_user1_id < p_user2_id THEN
      v_user1_sorted := p_user1_id;
      v_user2_sorted := p_user2_id;
    ELSE
      v_user1_sorted := p_user2_id;
      v_user2_sorted := p_user1_id;
    END IF;
    
    INSERT INTO conversations (user1_id, user2_id, listing_id, hidden_by_user1, hidden_by_user2)
    VALUES (v_user1_sorted, v_user2_sorted, p_listing_id, FALSE, FALSE)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Fonksiyon izinlerini ayarla
REVOKE ALL ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) TO authenticated, anon;

-- send_message fonksiyonunu güncelle - hidden kontrolü ekle
CREATE OR REPLACE FUNCTION send_message(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_content TEXT,
  p_listing_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  conversation_id UUID;
  message_id UUID;
  v_user1_id UUID;
  v_user2_id UUID;
  existing_conv_id UUID;
BEGIN
  -- Kendi kendine mesaj göndermeyi engelle
  IF p_sender_id = p_receiver_id THEN
    RAISE EXCEPTION 'Kendi kendinize mesaj gönderemezsiniz';
  END IF;
  
  -- İçerik kontrolü
  IF length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Mesaj içeriği boş olamaz';
  END IF;
  
  -- User ID'leri sırala (küçük UUID user1)
  IF p_sender_id < p_receiver_id THEN
    v_user1_id := p_sender_id;
    v_user2_id := p_receiver_id;
  ELSE
    v_user1_id := p_receiver_id;
    v_user2_id := p_sender_id;
  END IF;
  
  -- Mevcut konuşmayı ara (listing_id ile, hidden kontrolü olmadan)
  SELECT id INTO existing_conv_id
  FROM conversations 
  WHERE user1_id = v_user1_id 
    AND user2_id = v_user2_id
    AND (listing_id = p_listing_id OR (listing_id IS NULL AND p_listing_id IS NULL));
  
  -- Konuşma bulundu mu?
  IF existing_conv_id IS NOT NULL THEN
    conversation_id := existing_conv_id;
    
    -- Eğer konuşma sender için hidden ise, hidden flag'ini kaldır (unhide)
    -- Mesaj gönderildiğinde konuşma tekrar görünür olmalı
    IF p_sender_id = v_user1_id THEN
      -- Sender user1 ise
      UPDATE conversations 
      SET hidden_by_user1 = FALSE, updated_at = NOW()
      WHERE id = conversation_id AND hidden_by_user1 = TRUE;
    ELSE
      -- Sender user2 ise (p_sender_id = v_user2_id)
      UPDATE conversations 
      SET hidden_by_user2 = FALSE, updated_at = NOW()
      WHERE id = conversation_id AND hidden_by_user2 = TRUE;
    END IF;
  ELSE
    -- Konuşma yoksa yeni oluştur
    INSERT INTO conversations (user1_id, user2_id, listing_id, hidden_by_user1, hidden_by_user2)
    VALUES (v_user1_id, v_user2_id, p_listing_id, FALSE, FALSE)
    RETURNING id INTO conversation_id;
  END IF;
  
  -- Mesajı ekle
  INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
  VALUES (conversation_id, p_sender_id, p_receiver_id, trim(p_content))
  RETURNING id INTO message_id;
  
  -- Konuşmanın güncellenme zamanını güncelle (mesaj eklendiğinde)
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Eski 3 parametreli versiyonu da güncelle
CREATE OR REPLACE FUNCTION send_message(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Yeni 4 parametreli versiyonu çağır (listing_id = NULL ile)
  RETURN send_message(p_sender_id, p_receiver_id, p_content, NULL);
END;
$$;

-- Fonksiyon izinlerini ayarla
REVOKE ALL ON FUNCTION send_message(UUID, UUID, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT, UUID) TO authenticated, anon;
REVOKE ALL ON FUNCTION send_message(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT) TO authenticated, anon;

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations tablosuna hidden kolonları eklendi!';
  RAISE NOTICE '✅ Kullanıcılar artık sohbetleri sadece kendi görünümlerinden silebilir';
  RAISE NOTICE '✅ send_message fonksiyonu güncellendi - hidden konuşmalar göz ardı edilecek, yeni konuşma oluşturulacak';
END $$;

