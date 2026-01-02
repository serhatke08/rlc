-- Fix conversations UPDATE RLS policy
-- Remove WITH CHECK clause to allow updating hidden flags
-- This fixes the "new row violates row-level security policy" error

-- Drop existing UPDATE policy from 47_add_conversation_hidden_columns.sql
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Create UPDATE policy WITHOUT WITH CHECK clause
-- WITH CHECK causes issues because SELECT policy filters hidden rows
-- But we need to allow UPDATE to set hidden flags
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'conversations_update'
  ) THEN
    RAISE NOTICE '✅ Conversations UPDATE policy created successfully!';
    RAISE NOTICE '✅ Users can now update their own hidden flags';
  ELSE
    RAISE EXCEPTION 'Failed to create conversations_update policy';
  END IF;
END $$;

