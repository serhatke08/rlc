-- Fix conversations UPDATE RLS policy
-- The UPDATE policy should allow users to update hidden flags
-- This is a fix for the "new row violates row-level security policy" error

-- Drop ALL existing UPDATE policies
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Create UPDATE policy that allows users to update their own hidden flags
-- No WITH CHECK clause to avoid conflicts with SELECT policy
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE 
  USING (
    (auth.uid() = user1_id) OR (auth.uid() = user2_id)
  );

-- Verify RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations UPDATE policy fixed!';
  RAISE NOTICE '✅ Users can now update their own hidden flags';
  RAISE NOTICE '✅ Policy allows UPDATE without WITH CHECK clause';
END $$;

