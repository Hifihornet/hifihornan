-- Add status column to conversations table for tracking open/closed support tickets
ALTER TABLE public.conversations 
ADD COLUMN status text NOT NULL DEFAULT 'open';

-- Create index for filtering by status
CREATE INDEX idx_conversations_status ON public.conversations(status);

-- Create function to close a support conversation (admin only)
CREATE OR REPLACE FUNCTION public.admin_close_support_conversation(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to close support conversations';
  END IF;

  -- Update the conversation status to closed
  UPDATE public.conversations
  SET status = 'closed'
  WHERE id = _conversation_id
    AND listing_id IS NULL; -- Only support conversations (listing_id is null)
END;
$$;

-- Create function to reopen a support conversation (admin only)
CREATE OR REPLACE FUNCTION public.admin_reopen_support_conversation(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to reopen support conversations';
  END IF;

  -- Update the conversation status to open
  UPDATE public.conversations
  SET status = 'open'
  WHERE id = _conversation_id
    AND listing_id IS NULL;
END;
$$;

-- Create function to permanently delete a closed support conversation (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_support_conversation(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to delete support conversations';
  END IF;

  -- First delete all messages in the conversation
  DELETE FROM public.messages
  WHERE conversation_id = _conversation_id;

  -- Then delete the conversation itself
  DELETE FROM public.conversations
  WHERE id = _conversation_id
    AND listing_id IS NULL
    AND status = 'closed'; -- Only allow deleting closed conversations
END;
$$;