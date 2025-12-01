-- ============================================
-- PROFILES TABLOSU VE TEMEL YAPILAR
-- ============================================
-- Bu dosya 01_create_listings_schema.sql'den ÖNCE çalıştırılmalıdır
-- Profiles tablosu, auth.users tablosuna bağlıdır

-- ============================================
-- 1. PROFILES TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  website TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  avatar_url TEXT,
  header_media TEXT,
  avatar_bg_color TEXT,
  reputation INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  active_badge_icon TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BADGES TABLOSU (Opsiyonel - forum'dan kalma)
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#9c6cfe',
  category TEXT NOT NULL, -- 'activity', 'community', 'special'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. USER BADGES TABLOSU (Opsiyonel)
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 4. UPDATED_AT TRIGGER FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. PROFILES UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS (Row Level Security) POLİTİKALARI
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Politikaları
CREATE POLICY "Profiller herkese görünür" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Badges RLS Politikaları
CREATE POLICY "Rozetler herkese görünür" ON badges
  FOR SELECT USING (true);

-- User Badges RLS Politikaları
CREATE POLICY "Kullanıcı rozetleri herkese görünür" ON user_badges
  FOR SELECT USING (true);

-- ============================================
-- 7. OTOMATİK PROFİL OLUŞTURMA TRIGGER'I
-- ============================================
-- Yeni kullanıcı kaydı olduğunda otomatik profil oluşturur

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  username_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Base username oluştur
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    'user_' || substr(NEW.id::text, 1, 8)
  ));
  
  -- Username unique olana kadar sayı ekle
  final_username := base_username;
  
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = final_username) INTO username_exists;
    EXIT WHEN NOT username_exists;
    counter := counter + 1;
    final_username := base_username || '_' || counter::text;
  END LOOP;
  
  -- Profil oluştur
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    reputation,
    total_posts,
    total_comments,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      final_username
    ),
    0,
    0,
    0,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda logla ama işlemi durdurma
    RAISE LOG 'Profil oluşturma hatası: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. KULLANICI ADI KONTROL FONKSİYONU
-- ============================================
-- Kullanıcı adının müsait olup olmadığını kontrol eder

CREATE OR REPLACE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username)
  );
$$;

-- Fonksiyon izinleri
REVOKE ALL ON FUNCTION public.is_username_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- ============================================
-- 9. ÖRNEK BADGES (Opsiyonel)
-- ============================================

INSERT INTO badges (name, description, icon, category) VALUES
  ('İlk İlan', 'İlk ilanını oluşturdun', '📝', 'activity'),
  ('Aktif Satıcı', '10 ilan oluşturdun', '🔥', 'activity'),
  ('Süper Satıcı', '50 ilan oluşturdun', '⚡', 'activity'),
  ('Efsane Satıcı', '200 ilan oluşturdun', '👑', 'activity'),
  ('Güvenilir Satıcı', '100+ pozitif değerlendirme aldın', '⭐', 'community'),
  ('Hızlı Yanıt', 'Mesajlarına hızlı yanıt veriyorsun', '⚡', 'community'),
  ('Kurucu Üye', 'Site ilk ayında kayıt oldun', '⭐', 'special')
ON CONFLICT DO NOTHING;

-- ============================================
-- SON
-- ============================================

-- Bu dosya başarıyla çalıştırıldıktan sonra
-- 01_create_listings_schema.sql dosyasını çalıştırabilirsiniz

