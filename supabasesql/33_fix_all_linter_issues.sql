-- ============================================
-- FIX ALL SUPABASE LINTER ISSUES
-- ============================================
-- This file fixes all security linter issues:
-- 1. Remove SECURITY DEFINER from views
-- 2. Enable RLS on reports and blocks tables
-- 3. Add search_path to functions
-- ============================================

-- ============================================
-- 1. FIX VIEWS - Remove SECURITY DEFINER
-- ============================================

-- Fix comments view
DROP VIEW IF EXISTS public.comments;
CREATE VIEW public.comments AS
SELECT 
    lc.id,
    lc.listing_id,
    lc.user_id,
    lc.content,
    lc.created_at,
    lc.updated_at,
    p.username,
    p.display_name,
    p.avatar_url
FROM listing_comments lc
LEFT JOIN profiles p ON lc.user_id = p.id;

-- Fix cities_full_info view
DROP VIEW IF EXISTS public.cities_full_info;
CREATE VIEW public.cities_full_info AS
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

-- Fix regions_full_info view
DROP VIEW IF EXISTS public.regions_full_info;
CREATE VIEW public.regions_full_info AS
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
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.cities_full_info TO anon, authenticated;
GRANT SELECT ON public.regions_full_info TO anon, authenticated;

-- ============================================
-- 2. ENABLE RLS ON REPORTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports (if you have admin role, adjust as needed)
-- For now, only authenticated users can view their own reports

-- ============================================
-- 3. ENABLE RLS ON BLOCKS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE IF EXISTS public.blocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can create their own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocks;

-- Users can view blocks they created
CREATE POLICY "Users can view their own blocks" ON public.blocks
    FOR SELECT
    USING (auth.uid() = blocker_id);

-- Users can create blocks (blocking others)
CREATE POLICY "Users can create their own blocks" ON public.blocks
    FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete their own blocks" ON public.blocks
    FOR DELETE
    USING (auth.uid() = blocker_id);

-- ============================================
-- 4. FIX FUNCTION SEARCH_PATH
-- ============================================

-- Fix follow_user function
CREATE OR REPLACE FUNCTION public.follow_user(follower_id UUID, following_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    INSERT INTO user_follows (follower_id, following_id)
    VALUES (follower_id, following_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
END;
$$;

-- Fix unfollow_user function
CREATE OR REPLACE FUNCTION public.unfollow_user(follower_id UUID, following_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    DELETE FROM user_follows
    WHERE follower_id = follower_id
    AND following_id = following_id;
END;
$$;

-- Fix update_follower_counts_on_insert function
CREATE OR REPLACE FUNCTION public.update_follower_counts_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Update following count for follower
    UPDATE profiles
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE id = NEW.follower_id;
    
    -- Update follower count for following
    UPDATE profiles
    SET follower_count = COALESCE(follower_count, 0) + 1
    WHERE id = NEW.following_id;
    
    RETURN NEW;
END;
$$;

-- Fix update_follower_counts_on_delete function
CREATE OR REPLACE FUNCTION public.update_follower_counts_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Update following count for follower
    UPDATE profiles
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE id = OLD.follower_id;
    
    -- Update follower count for following
    UPDATE profiles
    SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0)
    WHERE id = OLD.following_id;
    
    RETURN OLD;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW public.comments IS 'Comments view without SECURITY DEFINER';
COMMENT ON VIEW public.cities_full_info IS 'Cities with full location info - fixed security';
COMMENT ON VIEW public.regions_full_info IS 'Regions with full location info - fixed security';
COMMENT ON TABLE public.reports IS 'Reports table with RLS enabled';
COMMENT ON TABLE public.blocks IS 'Blocks table with RLS enabled';

