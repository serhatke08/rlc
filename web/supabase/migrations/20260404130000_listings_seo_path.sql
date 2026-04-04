-- Hierarchical listing URLs: /{market}/{city}/{intent}/{category}/{item}
-- e.g. uk/manchester/free/electronics/iphone-12

ALTER TABLE listings ADD COLUMN IF NOT EXISTS seo_path text;

CREATE UNIQUE INDEX IF NOT EXISTS listings_seo_path_unique
  ON listings (seo_path)
  WHERE seo_path IS NOT NULL;

COMMENT ON COLUMN listings.seo_path IS 'Full path without leading slash; unique when set';
