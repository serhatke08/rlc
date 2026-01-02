-- Fix conversations UPDATE RLS policy
-- The UPDATE policy should allow users to update hidden flags even if SELECT policy filters them
-- This is a fix for the "new row violates row-level security policy" error

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Create UPDATE policy that allows users to update their own hidden flags
-- USING clause: which rows can be updated (must be user1 or user2)
-- WITH CHECK clause: what the updated row must satisfy (must still be user1 or user2)
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE 
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Ensure UPDATE permission is granted
GRANT UPDATE (hidden_by_user1, hidden_by_user2) ON conversations TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations UPDATE policy fixed!';
  RAISE NOTICE '✅ Users can now update their own hidden flags';
END $$;

