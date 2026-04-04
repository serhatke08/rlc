-- City landing page SEO intros (UK/US city pages)

ALTER TABLE cities ADD COLUMN IF NOT EXISTS seo_description text;

COMMENT ON COLUMN cities.seo_description IS 'Optional intro paragraph for /uk/{slug} and /us/{slug} pages';

DROP VIEW IF EXISTS public.cities_full_info CASCADE;

CREATE VIEW public.cities_full_info
WITH (security_invoker = true)
AS
SELECT
  c.id AS city_id,
  c.name AS city_name,
  c.is_major,
  c.seo_description,
  r.id AS region_id,
  r.name AS region_name,
  r.code AS region_code,
  co.id AS country_id,
  co.name AS country_name,
  co.code AS country_code,
  co.flag_emoji AS country_flag
FROM cities c
JOIN regions r ON c.region_id = r.id
JOIN countries co ON c.country_id = co.id;

ALTER VIEW public.cities_full_info OWNER TO postgres;
GRANT SELECT ON public.cities_full_info TO anon, authenticated;

COMMENT ON VIEW public.cities_full_info IS 'Cities with full location info';

-- Seed copy for major UK cities (match cities.name in DB)
UPDATE cities SET seo_description = 'Looking for free items in London? ReloopCycle is London''s community platform to give, get, swap or sell second-hand items locally. Join your local London community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'London';

UPDATE cities SET seo_description = 'Looking for free items in Manchester? ReloopCycle is Manchester''s community platform to give, get, swap or sell second-hand items locally. Join your local Manchester community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Manchester';

UPDATE cities SET seo_description = 'Looking for free items in Birmingham? ReloopCycle is Birmingham''s community platform to give, get, swap or sell second-hand items locally. Join your local Birmingham community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Birmingham';

UPDATE cities SET seo_description = 'Looking for free items in Liverpool? ReloopCycle is Liverpool''s community platform to give, get, swap or sell second-hand items locally. Join your local Liverpool community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Liverpool';

UPDATE cities SET seo_description = 'Looking for free items in Leeds? ReloopCycle is Leeds'' community platform to give, get, swap or sell second-hand items locally. Join your local Leeds community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Leeds';

UPDATE cities SET seo_description = 'Looking for free items in Bristol? ReloopCycle is Bristol''s community platform to give, get, swap or sell second-hand items locally. Join your local Bristol community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Bristol';

UPDATE cities SET seo_description = 'Looking for free items in Sheffield? ReloopCycle is Sheffield''s community platform to give, get, swap or sell second-hand items locally. Join your local Sheffield community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Sheffield';

UPDATE cities SET seo_description = 'Looking for free items in Edinburgh? ReloopCycle is Edinburgh''s community platform to give, get, swap or sell second-hand items locally. Join your local Edinburgh community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Edinburgh';

UPDATE cities SET seo_description = 'Looking for free items in Glasgow? ReloopCycle is Glasgow''s community platform to give, get, swap or sell second-hand items locally. Join your local Glasgow community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Glasgow';

UPDATE cities SET seo_description = 'Looking for free items in Cardiff? ReloopCycle is Cardiff''s community platform to give, get, swap or sell second-hand items locally. Join your local Cardiff community — declutter your home, find what you need, and help reduce waste.'
WHERE name = 'Cardiff';
