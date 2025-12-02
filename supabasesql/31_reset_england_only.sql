-- ====================================
-- RESET TO ENGLAND ONLY
-- ====================================
-- Mevcut regions ve cities tablolarını temizle
-- Sadece England için 9 bölge ve tüm şehirleri ekle
-- ====================================

-- ====================================
-- 1. MEVCUT VERİLERİ TEMİZLE
-- ====================================

-- Listings tablosundaki referansları önce temizle
UPDATE listings SET city_id = NULL WHERE city_id IS NOT NULL;
UPDATE listings SET region_id = NULL WHERE region_id IS NOT NULL;

-- Cities tablosunu temizle
DELETE FROM cities;

-- Regions tablosunu temizle (sadece England için olanları sil)
DELETE FROM regions WHERE country_id IN (
    SELECT id FROM countries WHERE code = 'GB'
);

-- ====================================
-- 2. UK ÜLKESİNİ KONTROL ET / OLUŞTUR
-- ====================================

DO $$
DECLARE
    uk_country_id UUID;
BEGIN
    -- UK ülkesini al veya oluştur
    SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
    
    IF uk_country_id IS NULL THEN
        INSERT INTO countries (name, code, phone_code, flag_emoji)
        VALUES ('United Kingdom', 'GB', '+44', '🇬🇧')
        RETURNING id INTO uk_country_id;
    END IF;
    
    -- ====================================
    -- 3. ENGLAND'IN 9 BÖLGESİNİ EKLE
    -- ====================================
    
    -- 1. North East England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'North East England', 'E12001')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 2. North West England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'North West England', 'E12002')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 3. Yorkshire and the Humber
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'Yorkshire and the Humber', 'E12003')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 4. East Midlands
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'East Midlands', 'E12004')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 5. West Midlands
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'West Midlands', 'E12005')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 6. East of England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'East of England', 'E12006')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 7. London
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'London', 'E12007')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 8. South East England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'South East England', 'E12008')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    -- 9. South West England
    INSERT INTO regions (country_id, name, code) 
    VALUES (uk_country_id, 'South West England', 'E12009')
    ON CONFLICT (country_id, name) DO NOTHING;
    
    RAISE NOTICE 'England 9 regions added successfully';
END $$;

-- ====================================
-- 4. ENGLAND'IN TÜM ŞEHİRLERİNİ EKLE
-- ====================================

DO $$
DECLARE
    uk_country_id UUID;
    north_east_id UUID;
    north_west_id UUID;
    yorkshire_id UUID;
    east_midlands_id UUID;
    west_midlands_id UUID;
    east_england_id UUID;
    london_id UUID;
    south_east_id UUID;
    south_west_id UUID;
BEGIN
    -- UK country ID
    SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
    
    -- Region ID'lerini al
    SELECT id INTO north_east_id FROM regions WHERE code = 'E12001';
    SELECT id INTO north_west_id FROM regions WHERE code = 'E12002';
    SELECT id INTO yorkshire_id FROM regions WHERE code = 'E12003';
    SELECT id INTO east_midlands_id FROM regions WHERE code = 'E12004';
    SELECT id INTO west_midlands_id FROM regions WHERE code = 'E12005';
    SELECT id INTO east_england_id FROM regions WHERE code = 'E12006';
    SELECT id INTO london_id FROM regions WHERE code = 'E12007';
    SELECT id INTO south_east_id FROM regions WHERE code = 'E12008';
    SELECT id INTO south_west_id FROM regions WHERE code = 'E12009';
    
    -- ====================================
    -- 1. NORTH EAST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (north_east_id, uk_country_id, 'Newcastle upon Tyne', true, 300000),
        (north_east_id, uk_country_id, 'Sunderland', true, 275000),
        (north_east_id, uk_country_id, 'Durham', true, 48000),
        (north_east_id, uk_country_id, 'Middlesbrough', false, 174000),
        (north_east_id, uk_country_id, 'Gateshead', false, 120000),
        (north_east_id, uk_country_id, 'South Shields', false, 75000),
        (north_east_id, uk_country_id, 'Hartlepool', false, 92000),
        (north_east_id, uk_country_id, 'Stockton-on-Tees', false, 83000),
        (north_east_id, uk_country_id, 'Darlington', false, 105000),
        (north_east_id, uk_country_id, 'Berwick-upon-Tweed', false, 13000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 2. NORTH WEST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (north_west_id, uk_country_id, 'Manchester', true, 550000),
        (north_west_id, uk_country_id, 'Liverpool', true, 500000),
        (north_west_id, uk_country_id, 'Preston', true, 141000),
        (north_west_id, uk_country_id, 'Blackpool', true, 139000),
        (north_west_id, uk_country_id, 'Bolton', false, 285000),
        (north_west_id, uk_country_id, 'Warrington', false, 210000),
        (north_west_id, uk_country_id, 'Blackburn', false, 148000),
        (north_west_id, uk_country_id, 'Wigan', false, 103000),
        (north_west_id, uk_country_id, 'Burnley', false, 87000),
        (north_west_id, uk_country_id, 'Lancaster', false, 53000),
        (north_west_id, uk_country_id, 'Carlisle', false, 75000),
        (north_west_id, uk_country_id, 'Chester', false, 79000),
        (north_west_id, uk_country_id, 'Salford', false, 245000),
        (north_west_id, uk_country_id, 'Rochdale', false, 110000),
        (north_west_id, uk_country_id, 'Oldham', false, 237000),
        (north_west_id, uk_country_id, 'Stockport', false, 137000),
        (north_west_id, uk_country_id, 'Bury', false, 78800),
        (north_west_id, uk_country_id, 'Southport', false, 92000),
        (north_west_id, uk_country_id, 'Barrow-in-Furness', false, 57000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 3. YORKSHIRE AND THE HUMBER
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (yorkshire_id, uk_country_id, 'Leeds', true, 790000),
        (yorkshire_id, uk_country_id, 'Sheffield', true, 580000),
        (yorkshire_id, uk_country_id, 'Bradford', true, 530000),
        (yorkshire_id, uk_country_id, 'Hull', true, 260000),
        (yorkshire_id, uk_country_id, 'York', true, 210000),
        (yorkshire_id, uk_country_id, 'Wakefield', false, 345000),
        (yorkshire_id, uk_country_id, 'Doncaster', false, 310000),
        (yorkshire_id, uk_country_id, 'Rotherham', false, 259000),
        (yorkshire_id, uk_country_id, 'Halifax', false, 88000),
        (yorkshire_id, uk_country_id, 'Huddersfield', false, 162000),
        (yorkshire_id, uk_country_id, 'Barnsley', false, 96000),
        (yorkshire_id, uk_country_id, 'Scunthorpe', false, 79000),
        (yorkshire_id, uk_country_id, 'Grimsby', false, 88000),
        (yorkshire_id, uk_country_id, 'Harrogate', false, 75000),
        (yorkshire_id, uk_country_id, 'Scarborough', false, 61000),
        (yorkshire_id, uk_country_id, 'Beverley', false, 32000),
        (yorkshire_id, uk_country_id, 'Ripon', false, 16000),
        (yorkshire_id, uk_country_id, 'Selby', false, 14000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 4. EAST MIDLANDS
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (east_midlands_id, uk_country_id, 'Nottingham', true, 330000),
        (east_midlands_id, uk_country_id, 'Leicester', true, 350000),
        (east_midlands_id, uk_country_id, 'Derby', true, 260000),
        (east_midlands_id, uk_country_id, 'Lincoln', true, 95000),
        (east_midlands_id, uk_country_id, 'Northampton', false, 245000),
        (east_midlands_id, uk_country_id, 'Mansfield', false, 110000),
        (east_midlands_id, uk_country_id, 'Chesterfield', false, 89000),
        (east_midlands_id, uk_country_id, 'Corby', false, 67000),
        (east_midlands_id, uk_country_id, 'Kettering', false, 57000),
        (east_midlands_id, uk_country_id, 'Grantham', false, 44000),
        (east_midlands_id, uk_country_id, 'Boston', false, 35000),
        (east_midlands_id, uk_country_id, 'Loughborough', false, 59000),
        (east_midlands_id, uk_country_id, 'Melton Mowbray', false, 27000),
        (east_midlands_id, uk_country_id, 'Worksop', false, 42000),
        (east_midlands_id, uk_country_id, 'Newark-on-Trent', false, 27000),
        (east_midlands_id, uk_country_id, 'Louth', false, 17000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 5. WEST MIDLANDS
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (west_midlands_id, uk_country_id, 'Birmingham', true, 1150000),
        (west_midlands_id, uk_country_id, 'Coventry', true, 360000),
        (west_midlands_id, uk_country_id, 'Wolverhampton', true, 260000),
        (west_midlands_id, uk_country_id, 'Stoke-on-Trent', true, 256000),
        (west_midlands_id, uk_country_id, 'Solihull', false, 206000),
        (west_midlands_id, uk_country_id, 'Walsall', false, 284000),
        (west_midlands_id, uk_country_id, 'Dudley', false, 320000),
        (west_midlands_id, uk_country_id, 'Sandwell', false, 325000),
        (west_midlands_id, uk_country_id, 'Worcester', false, 101000),
        (west_midlands_id, uk_country_id, 'Hereford', false, 63000),
        (west_midlands_id, uk_country_id, 'Rugby', false, 70000),
        (west_midlands_id, uk_country_id, 'Warwick', false, 32000),
        (west_midlands_id, uk_country_id, 'Stafford', false, 70000),
        (west_midlands_id, uk_country_id, 'Nuneaton', false, 86000),
        (west_midlands_id, uk_country_id, 'Tamworth', false, 76000),
        (west_midlands_id, uk_country_id, 'Redditch', false, 84000),
        (west_midlands_id, uk_country_id, 'Lichfield', false, 33000),
        (west_midlands_id, uk_country_id, 'Cannock', false, 68000),
        (west_midlands_id, uk_country_id, 'Telford', false, 158000),
        (west_midlands_id, uk_country_id, 'Shrewsbury', false, 72000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 6. EAST OF ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (east_england_id, uk_country_id, 'Cambridge', true, 145000),
        (east_england_id, uk_country_id, 'Norwich', true, 141000),
        (east_england_id, uk_country_id, 'Peterborough', true, 200000),
        (east_england_id, uk_country_id, 'Ipswich', true, 180000),
        (east_england_id, uk_country_id, 'Colchester', false, 120000),
        (east_england_id, uk_country_id, 'Chelmsford', false, 112000),
        (east_england_id, uk_country_id, 'Luton', false, 214000),
        (east_england_id, uk_country_id, 'Southend-on-Sea', false, 295000),
        (east_england_id, uk_country_id, 'Basildon', false, 187000),
        (east_england_id, uk_country_id, 'Milton Keynes', false, 270000),
        (east_england_id, uk_country_id, 'Stevenage', false, 89000),
        (east_england_id, uk_country_id, 'Harlow', false, 84000),
        (east_england_id, uk_country_id, 'Huntingdon', false, 25000),
        (east_england_id, uk_country_id, 'Ely', false, 21000),
        (east_england_id, uk_country_id, 'Wisbech', false, 31000),
        (east_england_id, uk_country_id, 'Bury St Edmunds', false, 41000),
        (east_england_id, uk_country_id, 'Thetford', false, 24000),
        (east_england_id, uk_country_id, 'King''s Lynn', false, 46000),
        (east_england_id, uk_country_id, 'Lowestoft', false, 71000),
        (east_england_id, uk_country_id, 'Great Yarmouth', false, 39000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 7. LONDON
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (london_id, uk_country_id, 'London', true, 9000000),
        (london_id, uk_country_id, 'Westminster', false, 250000),
        (london_id, uk_country_id, 'Camden', false, 270000),
        (london_id, uk_country_id, 'Islington', false, 260000),
        (london_id, uk_country_id, 'Hackney', false, 280000),
        (london_id, uk_country_id, 'Tower Hamlets', false, 318000),
        (london_id, uk_country_id, 'Greenwich', false, 286000),
        (london_id, uk_country_id, 'Lewisham', false, 305000),
        (london_id, uk_country_id, 'Southwark', false, 318000),
        (london_id, uk_country_id, 'Lambeth', false, 325000),
        (london_id, uk_country_id, 'Wandsworth', false, 330000),
        (london_id, uk_country_id, 'Hammersmith and Fulham', false, 185000),
        (london_id, uk_country_id, 'Kensington and Chelsea', false, 156000),
        (london_id, uk_country_id, 'City of London', false, 9700)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 8. SOUTH EAST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (south_east_id, uk_country_id, 'Brighton', true, 290000),
        (south_east_id, uk_country_id, 'Portsmouth', true, 248000),
        (south_east_id, uk_country_id, 'Southampton', true, 260000),
        (south_east_id, uk_country_id, 'Reading', true, 244000),
        (south_east_id, uk_country_id, 'Oxford', true, 160000),
        (south_east_id, uk_country_id, 'Canterbury', true, 55000),
        (south_east_id, uk_country_id, 'Maidstone', false, 180000),
        (south_east_id, uk_country_id, 'Guildford', false, 140000),
        (south_east_id, uk_country_id, 'Woking', false, 105000),
        (south_east_id, uk_country_id, 'Slough', false, 164000),
        (south_east_id, uk_country_id, 'Windsor', false, 33000),
        (south_east_id, uk_country_id, 'Winchester', false, 45000),
        (south_east_id, uk_country_id, 'Chichester', false, 32000),
        (south_east_id, uk_country_id, 'Basingstoke', false, 173000),
        (south_east_id, uk_country_id, 'Hastings', false, 91000),
        (south_east_id, uk_country_id, 'Eastbourne', false, 101000),
        (south_east_id, uk_country_id, 'Crawley', false, 112000),
        (south_east_id, uk_country_id, 'Worthing', false, 111000),
        (south_east_id, uk_country_id, 'St Albans', false, 147000),
        (south_east_id, uk_country_id, 'Aylesbury', false, 83000),
        (south_east_id, uk_country_id, 'High Wycombe', false, 125000),
        (south_east_id, uk_country_id, 'Farnham', false, 40000),
        (south_east_id, uk_country_id, 'Epsom', false, 29000),
        (south_east_id, uk_country_id, 'Reigate', false, 25000),
        (south_east_id, uk_country_id, 'Royal Tunbridge Wells', false, 59000),
        (south_east_id, uk_country_id, 'Rochester', false, 30000),
        (south_east_id, uk_country_id, 'Medway', false, 277000),
        (south_east_id, uk_country_id, 'Thanet', false, 134000),
        (south_east_id, uk_country_id, 'Dover', false, 34000),
        (south_east_id, uk_country_id, 'Folkestone', false, 52000),
        (south_east_id, uk_country_id, 'Rye', false, 5000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    -- ====================================
    -- 9. SOUTH WEST ENGLAND
    -- ====================================
    INSERT INTO cities (region_id, country_id, name, is_major, population) VALUES
        (south_west_id, uk_country_id, 'Bristol', true, 465000),
        (south_west_id, uk_country_id, 'Plymouth', true, 264000),
        (south_west_id, uk_country_id, 'Exeter', true, 130000),
        (south_west_id, uk_country_id, 'Bath', true, 94000),
        (south_west_id, uk_country_id, 'Gloucester', false, 130000),
        (south_west_id, uk_country_id, 'Swindon', false, 222000),
        (south_west_id, uk_country_id, 'Bournemouth', false, 198000),
        (south_west_id, uk_country_id, 'Poole', false, 157000),
        (south_west_id, uk_country_id, 'Torquay', false, 115000),
        (south_west_id, uk_country_id, 'Cheltenham', false, 117000),
        (south_west_id, uk_country_id, 'Salisbury', false, 41000),
        (south_west_id, uk_country_id, 'Weymouth', false, 54000),
        (south_west_id, uk_country_id, 'Truro', false, 22000),
        (south_west_id, uk_country_id, 'Falmouth', false, 23000),
        (south_west_id, uk_country_id, 'Penzance', false, 21000),
        (south_west_id, uk_country_id, 'Wells', false, 11000),
        (south_west_id, uk_country_id, 'Taunton', false, 64000),
        (south_west_id, uk_country_id, 'Yeovil', false, 46000),
        (south_west_id, uk_country_id, 'Weston-super-Mare', false, 76000),
        (south_west_id, uk_country_id, 'Bridgwater', false, 37000),
        (south_west_id, uk_country_id, 'Trowbridge', false, 34000),
        (south_west_id, uk_country_id, 'Chippenham', false, 36000),
        (south_west_id, uk_country_id, 'Stroud', false, 13000),
        (south_west_id, uk_country_id, 'Cirencester', false, 19000),
        (south_west_id, uk_country_id, 'Dorchester', false, 21000),
        (south_west_id, uk_country_id, 'Bridport', false, 14000)
    ON CONFLICT (region_id, name) DO NOTHING;
    
    RAISE NOTICE 'All England cities added successfully';
END $$;

-- ====================================
-- 5. KONTROL SORGULARI
-- ====================================

-- Bölge ve şehir sayılarını göster
SELECT 
    r.name as region_name,
    r.code as region_code,
    COUNT(c.id) as city_count,
    COUNT(CASE WHEN c.is_major = true THEN 1 END) as major_cities
FROM regions r
LEFT JOIN cities c ON c.region_id = r.id
WHERE r.country_id = (SELECT id FROM countries WHERE code = 'GB')
GROUP BY r.id, r.name, r.code
ORDER BY r.code;

-- Toplam şehir sayısı
SELECT 
    COUNT(*) as total_cities,
    COUNT(CASE WHEN is_major = true THEN 1 END) as major_cities,
    COUNT(CASE WHEN is_major = false THEN 1 END) as other_cities
FROM cities
WHERE country_id = (SELECT id FROM countries WHERE code = 'GB');

-- ====================================
-- END
-- ====================================

