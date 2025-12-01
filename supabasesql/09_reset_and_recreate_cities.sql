-- ============================================
-- RESET AND RECREATE UK CITIES TABLE
-- ============================================
-- Cities tablosunu temizleyip yeniden oluştur

-- Önce GB şehirlerinin ID'lerini al ve referansları temizle
-- Listings'deki city_id referanslarını geçici olarak NULL yap
UPDATE listings 
SET city_id = NULL 
WHERE city_id IN (
  SELECT id FROM cities WHERE country_code IN ('GB', 'EN')
);

-- Districts tablosundaki GB şehirlerine ait district'leri sil
-- NOT: Districts tablosu varsa ve city_id NOT NULL constraint'i varsa,
-- önce districts'leri sil, sonra cities'leri sil
-- Eğer districts tablosu yoksa veya hata olursa devam et
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'districts') THEN
    DELETE FROM districts 
    WHERE city_id IN (
      SELECT id FROM cities WHERE country_code IN ('GB', 'EN')
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Districts tablosu yoksa veya hata varsa devam et
    RAISE NOTICE 'Districts silme hatası: %', SQLERRM;
END $$;

-- England şehirlerini sil (GB yerine EN)
DELETE FROM cities WHERE country_code IN ('GB', 'EN');

-- ============================================
-- INSERT UK REGIONS (if not exists)
-- ============================================
INSERT INTO regions (name, slug, country_code, order_index) VALUES
  ('London', 'london-region', 'EN', 1),
  ('South East', 'south-east', 'EN', 2),
  ('South West', 'south-west', 'EN', 3),
  ('East of England', 'east-of-england', 'EN', 4),
  ('West Midlands', 'west-midlands', 'EN', 5),
  ('East Midlands', 'east-midlands', 'EN', 6),
  ('North West', 'north-west', 'EN', 7),
  ('North East', 'north-east', 'EN', 8),
  ('Yorkshire and the Humber', 'yorkshire-humber', 'EN', 9)
ON CONFLICT (slug) DO UPDATE SET country_code = 'EN';

-- ============================================
-- 1) NORTH EAST ENGLAND - 3 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Newcastle upon Tyne', 'newcastle-upon-tyne', 1),
  ('Sunderland', 'sunderland', 2),
  ('Durham', 'durham', 3)
) AS d(name, slug, order_index)
WHERE r.slug = 'north-east'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 2) NORTH WEST ENGLAND - 7 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Manchester', 'manchester', 1),
  ('Liverpool', 'liverpool', 2),
  ('Preston', 'preston', 3),
  ('Carlisle', 'carlisle', 4),
  ('Salford', 'salford', 5),
  ('Lancaster', 'lancaster', 6),
  ('Chester', 'chester', 7)
) AS d(name, slug, order_index)
WHERE r.slug = 'north-west'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 3) YORKSHIRE AND THE HUMBER - 7 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Leeds', 'leeds', 1),
  ('Sheffield', 'sheffield', 2),
  ('Bradford', 'bradford', 3),
  ('Wakefield', 'wakefield', 4),
  ('York', 'york', 5),
  ('Ripon', 'ripon', 6),
  ('Kingston upon Hull', 'kingston-upon-hull', 7)
) AS d(name, slug, order_index)
WHERE r.slug = 'yorkshire-humber'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 4) EAST MIDLANDS - 4 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Nottingham', 'nottingham', 1),
  ('Leicester', 'leicester', 2),
  ('Derby', 'derby', 3),
  ('Lincoln', 'lincoln', 4)
) AS d(name, slug, order_index)
WHERE r.slug = 'east-midlands'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 5) WEST MIDLANDS - 7 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Birmingham', 'birmingham', 1),
  ('Coventry', 'coventry', 2),
  ('Wolverhampton', 'wolverhampton', 3),
  ('Stoke-on-Trent', 'stoke-on-trent', 4),
  ('Worcester', 'worcester', 5),
  ('Hereford', 'hereford', 6),
  ('Lichfield', 'lichfield', 7)
) AS d(name, slug, order_index)
WHERE r.slug = 'west-midlands'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 6) EAST OF ENGLAND - 6 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Cambridge', 'cambridge', 1),
  ('Norwich', 'norwich', 2),
  ('Peterborough', 'peterborough', 3),
  ('Chelmsford', 'chelmsford', 4),
  ('Colchester', 'colchester', 5),
  ('Ely', 'ely', 6)
) AS d(name, slug, order_index)
WHERE r.slug = 'east-of-england'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 7) LONDON REGION - 2 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('London', 'london', 1),
  ('Westminster', 'westminster', 2)
) AS d(name, slug, order_index)
WHERE r.slug = 'london-region'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 8) SOUTH EAST ENGLAND - 9 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Brighton & Hove', 'brighton-hove', 1),
  ('Oxford', 'oxford', 2),
  ('Portsmouth', 'portsmouth', 3),
  ('Southampton', 'southampton', 4),
  ('Canterbury', 'canterbury', 5),
  ('Winchester', 'winchester', 6),
  ('Chichester', 'chichester', 7),
  ('Milton Keynes', 'milton-keynes', 8),
  ('St Albans', 'st-albans', 9)
) AS d(name, slug, order_index)
WHERE r.slug = 'south-east'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 9) SOUTH WEST ENGLAND - 8 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'EN',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Bristol', 'bristol', 1),
  ('Exeter', 'exeter', 2),
  ('Plymouth', 'plymouth', 3),
  ('Gloucester', 'gloucester', 4),
  ('Bath', 'bath', 5),
  ('Salisbury', 'salisbury', 6),
  ('Truro', 'truro', 7),
  ('Wells', 'wells', 8)
) AS d(name, slug, order_index)
WHERE r.slug = 'south-west'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'GB',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- ADD region_id TO listings TABLE
-- ============================================
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS idx_listings_region_id ON listings(region_id);

-- ============================================
-- UPDATE EXISTING LISTINGS WITH region_id
-- ============================================
-- Mevcut ilanların city_id'sine göre region_id ekle
UPDATE listings l
SET region_id = c.region_id
FROM cities c
WHERE l.city_id = c.id 
  AND c.region_id IS NOT NULL
  AND l.region_id IS NULL;

-- ============================================
-- END
-- ============================================

