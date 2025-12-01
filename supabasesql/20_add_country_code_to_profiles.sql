-- ============================================
-- ADD COUNTRY CODE TO PROFILES TABLE
-- ============================================
-- Kullanıcı profillerine ülke kodu ekler (EN, SC, WA, NI)

-- Profiles tablosuna country_code ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'EN';

-- Index ekle (filtreleme için)
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON profiles(country_code);

-- Mevcut profillere varsayılan olarak EN (England) ata
UPDATE profiles 
SET country_code = 'EN' 
WHERE country_code IS NULL;

-- ============================================
-- SON
-- ============================================

