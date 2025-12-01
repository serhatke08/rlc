-- ====================================
-- ADD COUNTRY_ID TO PROFILES
-- ====================================
-- Bu migration profiles tablosuna country_id ekler

-- Add country_id column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_country_id ON profiles(country_id);

-- Set all existing users' country to United Kingdom
UPDATE profiles 
SET country_id = (SELECT id FROM countries WHERE code = 'GB')
WHERE country_id IS NULL;

-- Comment
COMMENT ON COLUMN profiles.country_id IS 'User country reference - used for showing relevant regions and cities';

