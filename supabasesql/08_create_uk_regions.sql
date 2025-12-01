-- ============================================
-- UK REGIONS AND HIERARCHICAL CITY STRUCTURE
-- ============================================
-- İngiltere için bölgesel (region) yapı ve şehirler

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT 'GB',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add region_id to cities table
ALTER TABLE cities 
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS idx_cities_region_id ON cities(region_id);

-- Insert UK Regions
INSERT INTO regions (name, slug, country_code, order_index) VALUES
  ('London', 'london-region', 'GB', 1),
  ('South East', 'south-east', 'GB', 2),
  ('South West', 'south-west', 'GB', 3),
  ('East of England', 'east-of-england', 'GB', 4),
  ('West Midlands', 'west-midlands', 'GB', 5),
  ('East Midlands', 'east-midlands', 'GB', 6),
  ('North West', 'north-west', 'GB', 7),
  ('North East', 'north-east', 'GB', 8),
  ('Yorkshire and the Humber', 'yorkshire-humber', 'GB', 9)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- UPDATE EXISTING UK CITIES WITH REGIONS
-- (No deletion - preserves listings relationships)
-- ============================================

-- ============================================
-- 1) NORTH EAST ENGLAND - 3 Cities
-- ============================================
INSERT INTO cities (name, slug, country_code, region_id, order_index)
SELECT 
  d.name,
  d.slug,
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
  'GB',
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
-- CREATE FUNCTION TO GET CITIES BY REGION
-- ============================================
CREATE OR REPLACE FUNCTION get_cities_by_region(p_region_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  country_code TEXT,
  order_index INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.country_code, c.order_index
  FROM cities c
  WHERE c.region_id = p_region_id
  ORDER BY c.order_index, c.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- END
-- ============================================

