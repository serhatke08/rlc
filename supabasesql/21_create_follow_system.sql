-- ============================================
-- FOLLOW SYSTEM - TAKİPLEŞME SİSTEMİ
-- ============================================
-- Kullanıcıların birbirini takip etmesi için gerekli tablolar ve fonksiyonlar

-- ============================================
-- 1. USER FOLLOWS TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  -- Kendi kendini takip etmeyi engelle
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON user_follows(created_at DESC);

-- ============================================
-- 2. PROFILES TABLOSUNA TAKİPÇİ/TAKİP SAYILARI EKLE
-- ============================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_profiles_follower_count ON profiles(follower_count);
CREATE INDEX IF NOT EXISTS idx_profiles_following_count ON profiles(following_count);

-- ============================================
-- 3. TAKİP ET FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION follow_user(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kendi kendini takip etmeyi engelle
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  -- Takip ilişkisini oluştur (UNIQUE constraint sayesinde duplicate hatası olmaz)
  INSERT INTO user_follows (follower_id, following_id)
  VALUES (p_follower_id, p_following_id)
  ON CONFLICT (follower_id, following_id) DO NOTHING;

  -- Takip edilen kullanıcının takipçi sayısını artır
  UPDATE profiles
  SET follower_count = follower_count + 1
  WHERE id = p_following_id
    AND NOT EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = p_follower_id 
        AND following_id = p_following_id
        AND id != (SELECT id FROM user_follows WHERE follower_id = p_follower_id AND following_id = p_following_id LIMIT 1)
    );

  -- Takip eden kullanıcının takip sayısını artır
  UPDATE profiles
  SET following_count = following_count + 1
  WHERE id = p_follower_id
    AND NOT EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = p_follower_id 
        AND following_id = p_following_id
        AND id != (SELECT id FROM user_follows WHERE follower_id = p_follower_id AND following_id = p_following_id LIMIT 1)
    );
END;
$$;

-- ============================================
-- 4. TAKİBİ BIRAK FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION unfollow_user(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Takip ilişkisini sil
  DELETE FROM user_follows
  WHERE follower_id = p_follower_id
    AND following_id = p_following_id;

  -- Takip edilen kullanıcının takipçi sayısını azalt
  UPDATE profiles
  SET follower_count = GREATEST(0, follower_count - 1)
  WHERE id = p_following_id;

  -- Takip eden kullanıcının takip sayısını azalt
  UPDATE profiles
  SET following_count = GREATEST(0, following_count - 1)
  WHERE id = p_follower_id;
END;
$$;

-- ============================================
-- 5. TAKİPÇİ SAYILARINI GÜNCELLEYEN TRIGGER
-- ============================================

-- Takip eklendiğinde sayıları güncelle
CREATE OR REPLACE FUNCTION update_follower_counts_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Takip edilen kullanıcının takipçi sayısını artır
  UPDATE profiles
  SET follower_count = follower_count + 1
  WHERE id = NEW.following_id;

  -- Takip eden kullanıcının takip sayısını artır
  UPDATE profiles
  SET following_count = following_count + 1
  WHERE id = NEW.follower_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_counts_on_insert
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts_on_insert();

-- Takip silindiğinde sayıları güncelle
CREATE OR REPLACE FUNCTION update_follower_counts_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Takip edilen kullanıcının takipçi sayısını azalt
  UPDATE profiles
  SET follower_count = GREATEST(0, follower_count - 1)
  WHERE id = OLD.following_id;

  -- Takip eden kullanıcının takip sayısını azalt
  UPDATE profiles
  SET following_count = GREATEST(0, following_count - 1)
  WHERE id = OLD.follower_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_counts_on_delete
AFTER DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts_on_delete();

-- ============================================
-- 6. MEVCUT TAKİP SAYILARINI HESAPLA (İlk kurulum için)
-- ============================================

-- Mevcut takip ilişkilerinden sayıları güncelle
UPDATE profiles p
SET follower_count = (
  SELECT COUNT(*) 
  FROM user_follows 
  WHERE following_id = p.id
),
following_count = (
  SELECT COUNT(*) 
  FROM user_follows 
  WHERE follower_id = p.id
);

-- ============================================
-- 7. RLS POLİTİKALARI
-- ============================================

-- RLS'yi etkinleştir
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Herkes takip ilişkilerini okuyabilir
CREATE POLICY "Anyone can view follows"
ON user_follows
FOR SELECT
USING (true);

-- Kullanıcılar sadece kendi takip ilişkilerini oluşturabilir
CREATE POLICY "Users can create their own follows"
ON user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Kullanıcılar sadece kendi takip ilişkilerini silebilir
CREATE POLICY "Users can delete their own follows"
ON user_follows
FOR DELETE
USING (auth.uid() = follower_id);

-- ============================================
-- SON
-- ============================================

