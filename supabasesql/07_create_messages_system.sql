-- MESAJ SİSTEMİ - FULL IMPLEMENTATION
-- Bu SQL mesaj sistemini tamamen kuracak

-- ========================================
-- 1. AŞAMA: KONUŞMA TABLOSU OLUŞTUR
-- ========================================

-- Konuşmalar tablosu
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  -- Kendi kendine mesaj göndermeyi engelle
  CONSTRAINT no_self_conversation CHECK (user1_id != user2_id)
);

-- Performans için indexler
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- ========================================
-- 2. AŞAMA: MESAJLAR TABLOSU OLUŞTUR
-- ========================================

-- Mesajlar tablosu
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  -- Mesaj içeriği boş olamaz
  CONSTRAINT message_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performans için indexler
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

-- ========================================
-- 3. AŞAMA: MESAJ FONKSIYONLARI
-- ========================================

-- Konuşma oluştur veya getir fonksiyonu
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
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
  
  -- Mevcut konuşmayı ara (her iki yönden)
  SELECT id INTO conversation_id
  FROM conversations 
  WHERE (user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id);
  
  -- Konuşma yoksa oluştur
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (p_user1_id, p_user2_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Fonksiyon izinlerini ayarla
REVOKE ALL ON FUNCTION get_or_create_conversation(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated, anon;

-- Mesaj gönder fonksiyonu
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
  
  -- Konuşmayı oluştur veya getir
  SELECT get_or_create_conversation(p_sender_id, p_receiver_id) INTO conversation_id;
  
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
REVOKE ALL ON FUNCTION send_message(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT) TO authenticated, anon;

-- ========================================
-- 4. AŞAMA: TRIGGER'LAR
-- ========================================

-- Konuşma güncellenme zamanını otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ========================================
-- 5. AŞAMA: RLS POLİTİKALARI
-- ========================================

-- RLS'yi etkinleştir
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;

-- Konuşmalar için politikalar
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Mesajlar için politikalar
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- ========================================
-- 6. AŞAMA: REALTIME AKTİF ET
-- ========================================

-- Realtime publication'ı kontrol et ve oluştur
DO $$
BEGIN
  -- Eğer publication yoksa oluştur
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Messages tablosunu Realtime publication'a ekle
-- Eğer zaten ekliyse hata vermez (IF NOT EXISTS yok ama ALTER PUBLICATION hata vermez)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Zaten ekli, sorun yok
      NULL;
  END;
END $$;

-- Conversations tablosunu da ekleyelim (konuşma listesi güncellemeleri için)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Zaten ekli, sorun yok
      NULL;
  END;
END $$;

-- ========================================
-- 7. AŞAMA: BAŞARI MESAJI
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '🎉 MESAJ SİSTEMİ BAŞARIYLA KURULDU!';
  RAISE NOTICE '✅ conversations tablosu oluşturuldu';
  RAISE NOTICE '✅ messages tablosu oluşturuldu';
  RAISE NOTICE '✅ Mesaj fonksiyonları hazır';
  RAISE NOTICE '✅ RLS politikaları güvenli şekilde ayarlandı';
  RAISE NOTICE '✅ Realtime publication aktif edildi!';
  RAISE NOTICE '✅ messages tablosu Realtime için hazır';
  RAISE NOTICE '✅ conversations tablosu Realtime için hazır';
  RAISE NOTICE '🚀 Gerçek zamanlı mesajlaşma artık çalışıyor!';
END $$;

