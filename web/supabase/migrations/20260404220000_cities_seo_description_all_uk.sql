-- Apply SEO intro template to every city in UK routing (same scope as uk-city-slugs: GB, SCT, WLS, NIR, ENG)

UPDATE cities c
SET seo_description =
  'Looking for free items in ' || c.name
  || '? ReloopCycle is ' || c.name || '''s community platform to give, get, swap or sell second-hand items locally. Join your local '
  || c.name
  || ' community — declutter your home, find what you need, and help reduce waste.'
WHERE c.country_id IN (
  SELECT id FROM countries WHERE code IN ('GB', 'SCT', 'WLS', 'NIR', 'ENG')
);
