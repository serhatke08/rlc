-- ====================================
-- ADD ENGLAND'S 9 OFFICIAL REGIONS
-- ====================================
-- İngiltere'nin 9 resmi bölgesini ekler
-- Mevcut "England" region'unu korur (Scotland, Wales, Northern Ireland ile birlikte)
-- Yeni 9 bölge eklenir

DO $$
DECLARE
    uk_country_id UUID;
    england_old_id UUID;
    -- Yeni 9 bölge ID'leri
    east_england_id UUID;
    east_midlands_id UUID;
    london_id UUID;
    north_east_id UUID;
    north_west_id UUID;
    south_east_id UUID;
    south_west_id UUID;
    west_midlands_id UUID;
    yorkshire_id UUID;
BEGIN
    -- UK country ID'yi al
    SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
    
    IF uk_country_id IS NULL THEN
        RAISE EXCEPTION 'UK country not found';
    END IF;

    -- Mevcut "England" region'unu al (varsa)
    SELECT id INTO england_old_id 
    FROM regions 
    WHERE country_id = uk_country_id AND name = 'England';

    -- 1. East of England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'East of England', 'E12006')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO east_england_id;
    
    IF east_england_id IS NULL THEN
        SELECT id INTO east_england_id FROM regions WHERE country_id = uk_country_id AND name = 'East of England';
    END IF;

    -- 2. East Midlands
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'East Midlands', 'E12004')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO east_midlands_id;
    
    IF east_midlands_id IS NULL THEN
        SELECT id INTO east_midlands_id FROM regions WHERE country_id = uk_country_id AND name = 'East Midlands';
    END IF;

    -- 3. London
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'London', 'E12007')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO london_id;
    
    IF london_id IS NULL THEN
        SELECT id INTO london_id FROM regions WHERE country_id = uk_country_id AND name = 'London';
    END IF;

    -- 4. North East England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'North East England', 'E12001')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO north_east_id;
    
    IF north_east_id IS NULL THEN
        SELECT id INTO north_east_id FROM regions WHERE country_id = uk_country_id AND name = 'North East England';
    END IF;

    -- 5. North West England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'North West England', 'E12002')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO north_west_id;
    
    IF north_west_id IS NULL THEN
        SELECT id INTO north_west_id FROM regions WHERE country_id = uk_country_id AND name = 'North West England';
    END IF;

    -- 6. South East England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'South East England', 'E12008')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO south_east_id;
    
    IF south_east_id IS NULL THEN
        SELECT id INTO south_east_id FROM regions WHERE country_id = uk_country_id AND name = 'South East England';
    END IF;

    -- 7. South West England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'South West England', 'E12009')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO south_west_id;
    
    IF south_west_id IS NULL THEN
        SELECT id INTO south_west_id FROM regions WHERE country_id = uk_country_id AND name = 'South West England';
    END IF;

    -- 8. West Midlands
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'West Midlands', 'E12005')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO west_midlands_id;
    
    IF west_midlands_id IS NULL THEN
        SELECT id INTO west_midlands_id FROM regions WHERE country_id = uk_country_id AND name = 'West Midlands';
    END IF;

    -- 9. Yorkshire and the Humber
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'Yorkshire and the Humber', 'E12003')
    ON CONFLICT (country_id, name) DO NOTHING
    RETURNING id INTO yorkshire_id;
    
    IF yorkshire_id IS NULL THEN
        SELECT id INTO yorkshire_id FROM regions WHERE country_id = uk_country_id AND name = 'Yorkshire and the Humber';
    END IF;

    -- Şehirleri yeni bölgelere atama
    -- London → London region
    UPDATE cities 
    SET region_id = london_id 
    WHERE name = 'London' AND region_id = england_old_id;

    -- Manchester, Liverpool → North West England
    UPDATE cities 
    SET region_id = north_west_id 
    WHERE name IN ('Manchester', 'Liverpool') AND region_id = england_old_id;

    -- Birmingham, Coventry → West Midlands
    UPDATE cities 
    SET region_id = west_midlands_id 
    WHERE name IN ('Birmingham', 'Coventry', 'Derby') AND region_id = england_old_id;

    -- Leeds, Sheffield, Bradford, York → Yorkshire and the Humber
    UPDATE cities 
    SET region_id = yorkshire_id 
    WHERE name IN ('Leeds', 'Sheffield', 'Bradford', 'York') AND region_id = england_old_id;

    -- Newcastle → North East England
    UPDATE cities 
    SET region_id = north_east_id 
    WHERE name = 'Newcastle' AND region_id = england_old_id;

    -- Nottingham, Leicester → East Midlands
    UPDATE cities 
    SET region_id = east_midlands_id 
    WHERE name IN ('Nottingham', 'Leicester') AND region_id = england_old_id;

    -- Bristol, Plymouth, Exeter, Bath → South West England
    UPDATE cities 
    SET region_id = south_west_id 
    WHERE name IN ('Bristol', 'Plymouth', 'Exeter', 'Bath') AND region_id = england_old_id;

    -- Brighton, Portsmouth, Reading, Southampton, Cambridge, Oxford, Canterbury, Norwich → South East England
    UPDATE cities 
    SET region_id = south_east_id 
    WHERE name IN ('Brighton', 'Portsmouth', 'Reading', 'Southampton', 'Cambridge', 'Oxford', 'Canterbury', 'Norwich') AND region_id = england_old_id;

    -- Kalan şehirler (eğer varsa) → East of England
    UPDATE cities 
    SET region_id = east_england_id 
    WHERE region_id = england_old_id AND region_id IS NOT NULL;

    RAISE NOTICE 'England 9 regions added successfully';
    RAISE NOTICE 'Cities reassigned to new regions';
END $$;

-- Kontrol: Toplam kaç region var?
SELECT 
    r.name as region_name,
    r.code,
    COUNT(c.id) as city_count
FROM regions r
LEFT JOIN cities c ON c.region_id = r.id
WHERE r.country_id = (SELECT id FROM countries WHERE code = 'GB')
GROUP BY r.id, r.name, r.code
ORDER BY r.name;

