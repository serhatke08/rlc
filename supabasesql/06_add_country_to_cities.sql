-- ============================================
-- ADD COUNTRY CODE TO CITIES TABLE
-- ============================================
-- Şehirlere ülke kodu ekler (GB, TR, vb.)

-- Cities tablosuna country_code ekle
ALTER TABLE cities 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'TR';

-- Index ekle (filtreleme için)
CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);

-- Mevcut şehirlere varsayılan olarak TR ata (Türkiye)
UPDATE cities 
SET country_code = 'TR' 
WHERE country_code IS NULL;

-- UK şehirlerini güncelle (eğer varsa)
UPDATE cities 
SET country_code = 'GB' 
WHERE slug IN (
  'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 
  'sheffield', 'bristol', 'edinburgh', 'glasgow', 'cardiff',
  'newcastle-upon-tyne', 'nottingham', 'leicester', 'southampton',
  'brighton', 'belfast', 'coventry', 'reading', 'preston', 'oxford'
);

-- ============================================
-- SON
-- ============================================

