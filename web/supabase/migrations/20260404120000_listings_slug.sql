-- SEO listing URLs: /listing/{title-slug}-{city-slug}
-- Run via Supabase SQL editor or: supabase db push

ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_unique
  ON listings (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN listings.slug IS 'SEO path segment: title-slug-city-slug; unique when set';
