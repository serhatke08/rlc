-- Final fix for conversations UPDATE RLS policy
-- Problem: WITH CHECK clause causes "new row violates row-level security policy" error
-- Solution: Remove WITH CHECK clause completely - PostgreSQL will use USING for both

-- Step 1: Drop existing UPDATE policy (from 47_add_conversation_hidden_columns.sql)
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Step 2: Create UPDATE policy WITHOUT WITH CHECK clause
-- When WITH CHECK is omitted, PostgreSQL uses USING clause for both USING and WITH CHECK
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE 
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Step 3: Verify the policy was created correctly
DO $$
DECLARE
  policy_exists BOOLEAN;
  has_with_check BOOLEAN;
BEGIN
  -- Check if policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'conversations_update'
  ) INTO policy_exists;
  
  -- Check if WITH CHECK is NULL (should be NULL for our policy)
  SELECT (with_check IS NULL) INTO has_with_check
  FROM pg_policies 
  WHERE tablename = 'conversations' 
  AND policyname = 'conversations_update';
  
  IF policy_exists AND has_with_check THEN
    RAISE NOTICE '✅ Conversations UPDATE policy created successfully!';
    RAISE NOTICE '✅ Policy has no WITH CHECK clause - UPDATE will work correctly';
  ELSE
    RAISE WARNING 'Policy may not be configured correctly';
  END IF;
END $$;

