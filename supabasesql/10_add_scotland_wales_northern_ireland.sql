-- ============================================
-- ADD SCOTLAND, WALES, AND NORTHERN IRELAND AS SEPARATE COUNTRIES
-- ============================================
-- Her ülke kendi country_code'u ile ekleniyor

-- ============================================
-- UPDATE EXISTING ENGLAND REGIONS TO USE 'EN' COUNTRY CODE
-- ============================================
UPDATE regions 
SET country_code = 'EN' 
WHERE country_code = 'GB' 
  AND slug NOT IN ('scotland', 'wales', 'northern-ireland');

UPDATE cities 
SET country_code = 'EN' 
WHERE country_code = 'GB' 
  AND region_id IN (
    SELECT id FROM regions WHERE country_code = 'EN'
  );

-- ============================================
-- INSERT SCOTLAND, WALES, AND NORTHERN IRELAND REGIONS
-- ============================================
INSERT INTO regions (name, slug, country_code, order_index) VALUES
  ('Scotland', 'scotland', 'SC', 1),
  ('Wales', 'wales', 'WA', 1),
  ('Northern Ireland', 'northern-ireland', 'NI', 1)
ON CONFLICT (slug) DO UPDATE SET country_code = EXCLUDED.country_code;

-- ============================================
-- SCOTLAND - 7 Major Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'SC',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Edinburgh', 'edinburgh', 1),
  ('Glasgow', 'glasgow', 2),
  ('Aberdeen', 'aberdeen', 3),
  ('Dundee', 'dundee', 4),
  ('Inverness', 'inverness', 5),
  ('Perth', 'perth', 6),
  ('Stirling', 'stirling', 7)
) AS d(name, slug, order_index)
WHERE r.slug = 'scotland' AND r.country_code = 'SC'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'SC',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- WALES - 5 Major Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'WA',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Cardiff', 'cardiff', 1),
  ('Swansea', 'swansea', 2),
  ('Newport', 'newport', 3),
  ('Wrexham', 'wrexham', 4),
  ('Bangor', 'bangor', 5)
) AS d(name, slug, order_index)
WHERE r.slug = 'wales' AND r.country_code = 'WA'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'WA',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- NORTHERN IRELAND - 5 Major Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'NI',
  r.id,
  d.order_index
FROM regions r
CROSS JOIN (VALUES
  ('Belfast', 'belfast', 1),
  ('Derry', 'derry', 2),
  ('Lisburn', 'lisburn', 3),
  ('Newry', 'newry', 4),
  ('Armagh', 'armagh', 5)
) AS d(name, slug, order_index)
WHERE r.slug = 'northern-ireland' AND r.country_code = 'NI'
ON CONFLICT (slug) DO UPDATE SET 
  region_id = EXCLUDED.region_id,
  country_code = 'NI',
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ============================================
-- END
-- ============================================

