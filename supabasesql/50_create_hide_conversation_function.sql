-- Create RPC function to hide conversation
-- This bypasses RLS policy issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION hide_conversation(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
BEGIN
  -- Get conversation participants
  SELECT user1_id, user2_id
  INTO v_user1_id, v_user2_id
  FROM conversations
  WHERE id = p_conversation_id;
  
  -- Check if conversation exists
  IF v_user1_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;
  
  -- Check if user is a participant
  IF p_user_id != v_user1_id AND p_user_id != v_user2_id THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;
  
  -- Update the appropriate hidden flag
  IF p_user_id = v_user1_id THEN
    UPDATE conversations
    SET hidden_by_user1 = TRUE,
        updated_at = NOW()
    WHERE id = p_conversation_id;
  ELSE
    UPDATE conversations
    SET hidden_by_user2 = TRUE,
        updated_at = NOW()
    WHERE id = p_conversation_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION hide_conversation(UUID, UUID) TO authenticated;

-- Verify function was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'hide_conversation'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE '✅ hide_conversation function created successfully!';
  ELSE
    RAISE EXCEPTION 'Failed to create hide_conversation function';
  END IF;
END $$;

