-- Conversations tablosu için DELETE policy ekle
-- Kullanıcılar kendi konuşmalarını silebilsin

-- Mevcut DELETE policy'yi kaldır (varsa)
DROP POLICY IF EXISTS "conversations_delete" ON conversations;

-- DELETE policy oluştur
CREATE POLICY "conversations_delete" ON conversations
  FOR DELETE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations DELETE policy eklendi!';
  RAISE NOTICE '✅ Kullanıcılar artık kendi konuşmalarını silebilir';
END $$;

