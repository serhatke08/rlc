-- ====================================
-- GLOBAL LOCATION SYSTEM
-- Countries, Regions, Cities Tables
-- IDEMPOTENT: Can be run multiple times safely
-- ====================================

-- ====================================
-- COUNTRIES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    phone_code TEXT,
    flag_emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- ====================================
-- REGIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(country_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_regions_country_id ON regions(country_id);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);

-- ====================================
-- CITIES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    population INTEGER,
    is_major BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(region_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cities_region_id ON cities(region_id);
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_is_major ON cities(is_major);

-- ====================================
-- RLS POLICIES (Public Read Access)
-- ====================================

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON countries;
DROP POLICY IF EXISTS "Regions are viewable by everyone" ON regions;
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;

-- Countries: Public read access
CREATE POLICY "Countries are viewable by everyone"
    ON countries FOR SELECT
    USING (true);

-- Regions: Public read access
CREATE POLICY "Regions are viewable by everyone"
    ON regions FOR SELECT
    USING (true);

-- Cities: Public read access
CREATE POLICY "Cities are viewable by everyone"
    ON cities FOR SELECT
    USING (true);

-- ====================================
-- INSERT UK DATA (with conflict handling)
-- ====================================

-- Insert United Kingdom
INSERT INTO countries (name, code, phone_code, flag_emoji)
VALUES ('United Kingdom', 'GB', '+44', '🇬🇧')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    phone_code = EXCLUDED.phone_code,
    flag_emoji = EXCLUDED.flag_emoji;

-- Get UK country ID and insert regions/cities
DO $$
DECLARE
    uk_country_id UUID;
    england_id UUID;
    scotland_id UUID;
    wales_id UUID;
    northern_ireland_id UUID;
BEGIN
    -- Get UK country ID
    SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
    
    IF uk_country_id IS NULL THEN
        RAISE EXCEPTION 'UK country not found';
    END IF;

    -- Insert UK Regions (with conflict handling)
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'England', 'ENG')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO england_id;
    
    -- If no row was inserted, get existing id
    IF england_id IS NULL THEN
        SELECT id INTO england_id FROM regions WHERE country_id = uk_country_id AND name = 'England';
    END IF;
    
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'Scotland', 'SCT')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO scotland_id;
    
    IF scotland_id IS NULL THEN
        SELECT id INTO scotland_id FROM regions WHERE country_id = uk_country_id AND name = 'Scotland';
    END IF;
    
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'Wales', 'WLS')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO wales_id;
    
    IF wales_id IS NULL THEN
        SELECT id INTO wales_id FROM regions WHERE country_id = uk_country_id AND name = 'Wales';
    END IF;
    
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'Northern Ireland', 'NIR')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO northern_ireland_id;
    
    IF northern_ireland_id IS NULL THEN
        SELECT id INTO northern_ireland_id FROM regions WHERE country_id = uk_country_id AND name = 'Northern Ireland';
    END IF;

    -- Insert England Cities
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (england_id, uk_country_id, 'London', true),
        (england_id, uk_country_id, 'Manchester', true),
        (england_id, uk_country_id, 'Birmingham', true),
        (england_id, uk_country_id, 'Liverpool', true),
        (england_id, uk_country_id, 'Leeds', true),
        (england_id, uk_country_id, 'Newcastle', true),
        (england_id, uk_country_id, 'Sheffield', true),
        (england_id, uk_country_id, 'Bristol', true),
        (england_id, uk_country_id, 'Nottingham', true),
        (england_id, uk_country_id, 'Southampton', true),
        (england_id, uk_country_id, 'Leicester', true),
        (england_id, uk_country_id, 'Coventry', false),
        (england_id, uk_country_id, 'Bradford', false),
        (england_id, uk_country_id, 'Brighton', false),
        (england_id, uk_country_id, 'Portsmouth', false),
        (england_id, uk_country_id, 'Reading', false),
        (england_id, uk_country_id, 'Cambridge', false),
        (england_id, uk_country_id, 'Oxford', false),
        (england_id, uk_country_id, 'York', false),
        (england_id, uk_country_id, 'Norwich', false),
        (england_id, uk_country_id, 'Plymouth', false),
        (england_id, uk_country_id, 'Derby', false),
        (england_id, uk_country_id, 'Exeter', false),
        (england_id, uk_country_id, 'Bath', false),
        (england_id, uk_country_id, 'Canterbury', false)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- Insert Scotland Cities
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (scotland_id, uk_country_id, 'Edinburgh', true),
        (scotland_id, uk_country_id, 'Glasgow', true),
        (scotland_id, uk_country_id, 'Aberdeen', true),
        (scotland_id, uk_country_id, 'Dundee', false),
        (scotland_id, uk_country_id, 'Inverness', false),
        (scotland_id, uk_country_id, 'Stirling', false),
        (scotland_id, uk_country_id, 'Perth', false)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- Insert Wales Cities
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (wales_id, uk_country_id, 'Cardiff', true),
        (wales_id, uk_country_id, 'Swansea', true),
        (wales_id, uk_country_id, 'Newport', false),
        (wales_id, uk_country_id, 'Wrexham', false),
        (wales_id, uk_country_id, 'Bangor', false),
        (wales_id, uk_country_id, 'Aberystwyth', false)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- Insert Northern Ireland Cities
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (northern_ireland_id, uk_country_id, 'Belfast', true),
        (northern_ireland_id, uk_country_id, 'Derry', true),
        (northern_ireland_id, uk_country_id, 'Lisburn', false),
        (northern_ireland_id, uk_country_id, 'Newry', false),
        (northern_ireland_id, uk_country_id, 'Armagh', false)
    ON CONFLICT (region_id, name) DO NOTHING;

END $$;

-- ====================================
-- UPDATE LISTINGS TABLE
-- ====================================

-- Listings tablosunda zaten country_id, region_id, city_id var
-- Önce mevcut region_id ve city_id'leri temizle (eski tablolara ait)
-- Sonra yeni tables'a map et

DO $$
DECLARE
    uk_id UUID;
    england_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO uk_id FROM countries WHERE code = 'GB';
    SELECT id INTO england_id FROM regions WHERE code = 'ENG';

    -- Mevcut region_id ve city_id'leri NULL yap (eski tablolara ait)
    UPDATE listings SET region_id = NULL WHERE region_id IS NOT NULL;
    UPDATE listings SET city_id = NULL WHERE city_id IS NOT NULL;
    
    -- Update listings with NULL country_id
    UPDATE listings
    SET country_id = uk_id
    WHERE country_id IS NULL;
    
    -- Update listings with NULL region_id (hepsini England yap)
    UPDATE listings
    SET region_id = england_id
    WHERE country_id = uk_id;
    
    -- Map city_name to new cities table
    UPDATE listings l
    SET city_id = c.id
    FROM cities c
    WHERE LOWER(l.city_name) = LOWER(c.name);
    
    -- Eğer hala NULL ise, London'a ata
    UPDATE listings
    SET city_id = (SELECT id FROM cities WHERE name = 'London' LIMIT 1)
    WHERE city_id IS NULL;
END $$;

-- Şimdi foreign key constraint'lerini ekle
DO $$
BEGIN
    -- Eski constraint'leri sil
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_city_id_fkey;
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_region_id_fkey;
    
    -- Yeni cities tablosuna foreign key ekle
    BEGIN
        ALTER TABLE listings 
            ADD CONSTRAINT listings_city_id_fkey 
            FOREIGN KEY (city_id) REFERENCES cities(id);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint listings_city_id_fkey already exists, skipping';
    END;
    
    -- Region_id constraint ekle
    BEGIN
        ALTER TABLE listings 
            ADD CONSTRAINT listings_region_id_fkey 
            FOREIGN KEY (region_id) REFERENCES regions(id);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint listings_region_id_fkey already exists, skipping';
    END;
        
END $$;

-- Indexes zaten var olabilir
CREATE INDEX IF NOT EXISTS idx_listings_country_id ON listings(country_id);
CREATE INDEX IF NOT EXISTS idx_listings_region_id ON listings(region_id);
CREATE INDEX IF NOT EXISTS idx_listings_city_id ON listings(city_id);

-- ====================================
-- HELPER VIEWS
-- ====================================

-- Drop views if they exist
DROP VIEW IF EXISTS cities_full_info;
DROP VIEW IF EXISTS regions_full_info;

-- View to get cities with their full location info
CREATE VIEW cities_full_info AS
SELECT 
    c.id as city_id,
    c.name as city_name,
    c.is_major,
    r.id as region_id,
    r.name as region_name,
    r.code as region_code,
    co.id as country_id,
    co.name as country_name,
    co.code as country_code,
    co.flag_emoji as country_flag
FROM cities c
JOIN regions r ON c.region_id = r.id
JOIN countries co ON c.country_id = co.id;

-- View to get regions with country info
CREATE VIEW regions_full_info AS
SELECT 
    r.id as region_id,
    r.name as region_name,
    r.code as region_code,
    co.id as country_id,
    co.name as country_name,
    co.code as country_code,
    co.flag_emoji as country_flag,
    COUNT(c.id) as cities_count
FROM regions r
JOIN countries co ON r.country_id = co.id
LEFT JOIN cities c ON c.region_id = r.id
GROUP BY r.id, r.name, r.code, co.id, co.name, co.code, co.flag_emoji;

-- Grant permissions on views
GRANT SELECT ON cities_full_info TO anon, authenticated;
GRANT SELECT ON regions_full_info TO anon, authenticated;

-- ====================================
-- COMMENTS
-- ====================================

COMMENT ON TABLE countries IS 'Global countries table - expandable to all countries worldwide';
COMMENT ON TABLE regions IS 'Regions/states/provinces within countries';
COMMENT ON TABLE cities IS 'Cities within regions - is_major flag indicates major cities for quick filters';
COMMENT ON VIEW cities_full_info IS 'Complete city information with region and country details';
COMMENT ON VIEW regions_full_info IS 'Complete region information with country details and city count';

-- ====================================
-- SAMPLE QUERIES
-- ====================================

-- Get all UK regions with cities:
-- SELECT * FROM regions_full_info WHERE country_code = 'GB';

-- Get all major UK cities:
-- SELECT * FROM cities_full_info WHERE country_code = 'GB' AND is_major = true;

-- Get cities in England:
-- SELECT city_name FROM cities_full_info WHERE region_code = 'ENG';
