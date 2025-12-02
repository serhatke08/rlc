-- ====================================
-- ADD CITIES TO EXISTING REGIONS
-- ====================================
-- Mevcut region ID'lerine göre şehirleri ekle
-- Kullanıcının verdiği şehir listesini doğru bölgelere atama
-- ====================================

DO $$
DECLARE
    uk_country_id UUID;
    -- Region ID'leri (kullanıcının verdiği)
    north_east_id UUID := 'a9131682-fbcf-4414-9cc8-53bfc3a28b74';
    north_west_id UUID := 'd7dfc6e4-fbe4-449c-82cb-595aed2d92b1';
    yorkshire_id UUID := 'f9e51826-9cec-4e38-b192-9ebff5241c2f';
    east_midlands_id UUID := '22f6e149-9579-449b-a187-48a91d07bf68';
    west_midlands_id UUID := 'a1207089-2568-4b1c-bef9-ca50b61de954';
    east_england_id UUID := '1cf85cad-d902-4c40-a875-9dedc24c1230';
    london_id UUID := '257ac0b8-7ea5-40cf-8ed6-008dcecb0a4f';
    south_east_id UUID := '2153c483-dc9c-4717-acef-9f913dac5f54';
    south_west_id UUID := 'c1f6d1f2-aa12-4572-960d-35b3b06174b6';
BEGIN
    -- UK country ID'yi al
    SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
    
    IF uk_country_id IS NULL THEN
        RAISE EXCEPTION 'UK country not found';
    END IF;

    -- ====================================
    -- 1. NORTH EAST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (north_east_id, uk_country_id, 'Newcastle upon Tyne', true),
        (north_east_id, uk_country_id, 'Sunderland', true),
        (north_east_id, uk_country_id, 'Durham', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 2. NORTH WEST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (north_west_id, uk_country_id, 'Manchester', true),
        (north_west_id, uk_country_id, 'Liverpool', true),
        (north_west_id, uk_country_id, 'Preston', true),
        (north_west_id, uk_country_id, 'Lancaster', true),
        (north_west_id, uk_country_id, 'Chester', true),
        (north_west_id, uk_country_id, 'Carlisle', true),
        (north_west_id, uk_country_id, 'Salford', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 3. YORKSHIRE AND THE HUMBER
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (yorkshire_id, uk_country_id, 'Leeds', true),
        (yorkshire_id, uk_country_id, 'Sheffield', true),
        (yorkshire_id, uk_country_id, 'Bradford', true),
        (yorkshire_id, uk_country_id, 'Hull', true),
        (yorkshire_id, uk_country_id, 'York', true),
        (yorkshire_id, uk_country_id, 'Wakefield', true),
        (yorkshire_id, uk_country_id, 'Ripon', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 4. EAST MIDLANDS
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (east_midlands_id, uk_country_id, 'Nottingham', true),
        (east_midlands_id, uk_country_id, 'Leicester', true),
        (east_midlands_id, uk_country_id, 'Derby', true),
        (east_midlands_id, uk_country_id, 'Lincoln', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 5. WEST MIDLANDS
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (west_midlands_id, uk_country_id, 'Birmingham', true),
        (west_midlands_id, uk_country_id, 'Coventry', true),
        (west_midlands_id, uk_country_id, 'Wolverhampton', true),
        (west_midlands_id, uk_country_id, 'Stoke-on-Trent', true),
        (west_midlands_id, uk_country_id, 'Worcester', true),
        (west_midlands_id, uk_country_id, 'Hereford', true),
        (west_midlands_id, uk_country_id, 'Lichfield', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 6. EAST OF ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (east_england_id, uk_country_id, 'Cambridge', true),
        (east_england_id, uk_country_id, 'Norwich', true),
        (east_england_id, uk_country_id, 'Peterborough', true),
        (east_england_id, uk_country_id, 'Chelmsford', true),
        (east_england_id, uk_country_id, 'Ely', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 7. LONDON
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (london_id, uk_country_id, 'London', true),
        (london_id, uk_country_id, 'City of London', true),
        (london_id, uk_country_id, 'Westminster', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 8. SOUTH EAST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (south_east_id, uk_country_id, 'Brighton and Hove', true),
        (south_east_id, uk_country_id, 'Portsmouth', true),
        (south_east_id, uk_country_id, 'Southampton', true),
        (south_east_id, uk_country_id, 'Oxford', true),
        (south_east_id, uk_country_id, 'Canterbury', true),
        (south_east_id, uk_country_id, 'Winchester', true),
        (south_east_id, uk_country_id, 'Chichester', true),
        (south_east_id, uk_country_id, 'St Albans', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    -- ====================================
    -- 9. SOUTH WEST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major) VALUES
        (south_west_id, uk_country_id, 'Bristol', true),
        (south_west_id, uk_country_id, 'Plymouth', true),
        (south_west_id, uk_country_id, 'Exeter', true),
        (south_west_id, uk_country_id, 'Bath', true),
        (south_west_id, uk_country_id, 'Gloucester', true),
        (south_west_id, uk_country_id, 'Salisbury', true),
        (south_west_id, uk_country_id, 'Truro', true),
        (south_west_id, uk_country_id, 'Wells', true)
    ON CONFLICT (region_id, name) DO UPDATE SET
        is_major = EXCLUDED.is_major,
        country_id = EXCLUDED.country_id;

    RAISE NOTICE 'Cities added successfully to all regions';
END $$;

-- ====================================
-- KONTROL SORGULARI
-- ====================================

-- Her bölgedeki şehir sayısını göster
SELECT 
    r.name as region_name,
    r.code as region_code,
    COUNT(c.id) as city_count,
    STRING_AGG(c.name, ' · ' ORDER BY c.is_major DESC, c.name) as cities
FROM regions r
LEFT JOIN cities c ON c.region_id = r.id
WHERE r.country_id = (SELECT id FROM countries WHERE code = 'GB')
GROUP BY r.id, r.name, r.code
ORDER BY r.code;

-- Toplam şehir sayısı
SELECT 
    COUNT(*) as total_cities,
    COUNT(CASE WHEN is_major = true THEN 1 END) as major_cities
FROM cities
WHERE country_id = (SELECT id FROM countries WHERE code = 'GB');

-- ====================================
-- END
-- ====================================

