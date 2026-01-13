-- Update the admin_close_support_conversation function to also delete all messages
CREATE OR REPLACE FUNCTION public.admin_close_support_conversation(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to close support conversations';
  END IF;

  -- Delete all messages in the conversation
  DELETE FROM public.messages
  WHERE conversation_id = _conversation_id;

  -- Delete the conversation itself
  DELETE FROM public.conversations
  WHERE id = _conversation_id
    AND listing_id IS NULL; -- Only support conversations
END;
$$;