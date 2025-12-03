-- ============================================
-- FIX VIEWS - Remove SECURITY DEFINER
-- ============================================
-- This file fixes the SECURITY DEFINER issue on views:
-- - comments
-- - cities_full_info
-- - regions_full_info
-- ============================================

-- Drop views with CASCADE to remove all dependencies
DROP VIEW IF EXISTS public.comments CASCADE;
DROP VIEW IF EXISTS public.cities_full_info CASCADE;
DROP VIEW IF EXISTS public.regions_full_info CASCADE;

-- Recreate comments view as SECURITY INVOKER (PostgreSQL 15+)
-- If your PostgreSQL version doesn't support security_invoker, remove the WITH clause
CREATE VIEW public.comments 
WITH (security_invoker = true)
AS
SELECT 
    lc.id,
    lc.listing_id,
    lc.user_id,
    lc.content,
    lc.parent_id,
    lc.is_approved,
    lc.created_at,
    lc.updated_at
FROM listing_comments lc;

-- Recreate cities_full_info view as SECURITY INVOKER
CREATE VIEW public.cities_full_info 
WITH (security_invoker = true)
AS
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

-- Recreate regions_full_info view as SECURITY INVOKER
CREATE VIEW public.regions_full_info 
WITH (security_invoker = true)
AS
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

-- Change ownership to postgres role
ALTER VIEW public.comments OWNER TO postgres;
ALTER VIEW public.cities_full_info OWNER TO postgres;
ALTER VIEW public.regions_full_info OWNER TO postgres;

-- Grant permissions on views
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.cities_full_info TO anon, authenticated;
GRANT SELECT ON public.regions_full_info TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW public.comments IS 'Comments view without SECURITY DEFINER';
COMMENT ON VIEW public.cities_full_info IS 'Cities with full location info - fixed security';
COMMENT ON VIEW public.regions_full_info IS 'Regions with full location info - fixed security';

