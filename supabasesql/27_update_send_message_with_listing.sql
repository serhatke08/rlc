-- ====================================
-- UPDATE SEND_MESSAGE FUNCTION
-- Add listing_id support
-- ====================================

-- Mesaj gönder fonksiyonunu güncelle (listing_id desteği ile)
-- Hem eski 3 parametreli hem yeni 4 parametreli versiyon çalışacak
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
BEGIN
  -- Kendi kendine mesaj göndermeyi engelle
  IF p_sender_id = p_receiver_id THEN
    RAISE EXCEPTION 'Kendi kendinize mesaj gönderemezsiniz';
  END IF;
  
  -- İçerik kontrolü
  IF length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Mesaj içeriği boş olamaz';
  END IF;
  
  -- Konuşmayı oluştur veya getir (listing_id ile)
  -- get_or_create_conversation fonksiyonu zaten listing_id desteği ile güncellenmiş olmalı
  SELECT get_or_create_conversation(p_sender_id, p_receiver_id, p_listing_id) INTO conversation_id;
  
  -- Mesajı ekle
  INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
  VALUES (conversation_id, p_sender_id, p_receiver_id, trim(p_content))
  RETURNING id INTO message_id;
  
  -- Konuşmanın güncellenme zamanını güncelle
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Fonksiyon izinlerini ayarla
REVOKE ALL ON FUNCTION send_message(UUID, UUID, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT, UUID) TO authenticated, anon;

-- Eski 3 parametreli versiyonu da güncelle (geriye dönük uyumluluk için)
-- Bu, eski kodların çalışmaya devam etmesi için
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

-- Eski versiyon için de izinler
REVOKE ALL ON FUNCTION send_message(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT) TO authenticated, anon;

COMMENT ON FUNCTION send_message(UUID, UUID, TEXT, UUID) IS 'Send a message with optional listing_id support';
COMMENT ON FUNCTION send_message(UUID, UUID, TEXT) IS 'Send a message (backward compatibility, calls 4-parameter version with NULL listing_id)';

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ send_message fonksiyonu listing_id desteği ile güncellendi!';
  RAISE NOTICE '✅ Hem eski (3 param) hem yeni (4 param) versiyon çalışıyor!';
END $$;

