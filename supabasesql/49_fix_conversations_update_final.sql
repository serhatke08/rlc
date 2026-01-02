-- Final fix for conversations UPDATE RLS policy
-- The issue is that WITH CHECK clause conflicts with SELECT policy
-- Solution: Use USING clause only, PostgreSQL will use it for both checks

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Create UPDATE policy with USING clause only
-- PostgreSQL uses USING clause for WITH CHECK when WITH CHECK is not specified
-- This allows updating hidden flags without SELECT policy interference
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE 
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Verify policy exists
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'conversations' 
  AND policyname = 'conversations_update';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✅ Conversations UPDATE policy created successfully!';
  ELSE
    RAISE EXCEPTION 'Failed to create conversations_update policy';
  END IF;
END $$;

