-- ====================================
-- REMOVE DUPLICATE COUNTRIES
-- ====================================
-- Aynı code'a sahip duplicate ülkeleri temizler
-- Her code için en eski kaydı tutar, diğerlerini siler

-- Önce duplicate'leri kontrol et
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Duplicate sayısını kontrol et
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT code, COUNT(*) as cnt
    FROM countries
    GROUP BY code
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate country codes', duplicate_count;
    
    -- Duplicate'leri göster
    RAISE NOTICE 'Duplicate countries:';
    
    -- Duplicate'leri temizle - her code için en eski kaydı tut
    DELETE FROM countries
    WHERE id NOT IN (
      SELECT DISTINCT ON (code) id
      FROM countries
      ORDER BY code, created_at ASC
    );
    
    RAISE NOTICE 'Duplicate countries removed successfully';
  ELSE
    RAISE NOTICE 'No duplicate countries found';
  END IF;
END $$;

-- Sonuç kontrolü
SELECT code, name, COUNT(*) as count
FROM countries
GROUP BY code, name
ORDER BY code;

