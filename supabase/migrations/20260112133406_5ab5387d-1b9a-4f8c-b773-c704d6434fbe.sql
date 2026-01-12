-- Create a system user ID constant for HiFiHörnan admin messages
-- We'll use a special UUID that represents the HiFiHörnan system
-- This allows admin messages to appear from "HiFiHörnan" instead of the admin's personal account

-- Add is_system_message column to messages to identify admin/system messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_system_message boolean DEFAULT false;

-- Create a function for admin to send direct messages to users
CREATE OR REPLACE FUNCTION public.admin_send_direct_message(_recipient_user_id uuid, _listing_id uuid, _content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conversation_id uuid;
  _message_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to send admin messages';
  END IF;

  -- Check if conversation exists for this listing with this user as buyer or seller
  SELECT id INTO _conversation_id
  FROM public.conversations
  WHERE listing_id = _listing_id 
    AND (buyer_id = _recipient_user_id OR seller_id = _recipient_user_id)
  LIMIT 1;

  -- If no conversation exists, create one with admin as seller and recipient as buyer
  IF _conversation_id IS NULL THEN
    INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
    VALUES (_listing_id, _recipient_user_id, auth.uid())
    RETURNING id INTO _conversation_id;
  END IF;

  -- Insert the message marked as system message
  INSERT INTO public.messages (conversation_id, sender_id, content, is_system_message)
  VALUES (_conversation_id, auth.uid(), _content, true)
  RETURNING id INTO _message_id;

  RETURN _message_id;
END;
$$;

-- Create a function for admin to start a new conversation with a user (without needing a listing)
-- This creates a special "system" listing for admin communications
CREATE OR REPLACE FUNCTION public.admin_send_message_to_user(_recipient_user_id uuid, _content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _system_listing_id uuid;
  _conversation_id uuid;
  _message_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to send admin messages';
  END IF;

  -- Look for existing admin conversation with this user
  -- An admin conversation is one where the admin is seller and the message is a system message
  SELECT c.id INTO _conversation_id
  FROM public.conversations c
  INNER JOIN public.messages m ON m.conversation_id = c.id
  WHERE c.seller_id = auth.uid() 
    AND c.buyer_id = _recipient_user_id
    AND m.is_system_message = true
  LIMIT 1;

  -- If no admin conversation exists, we need to create a placeholder listing first
  IF _conversation_id IS NULL THEN
    -- Create a system listing for admin communications
    INSERT INTO public.listings (
      user_id, 
      title, 
      description, 
      category, 
      brand, 
      condition, 
      price, 
      location, 
      status
    )
    VALUES (
      auth.uid(),
      'Meddelande från HiFiHörnan',
      'Systemmeddelande från HiFiHörnan administration',
      'Övrigt',
      'HiFiHörnan',
      'Nytt',
      0,
      'System',
      'system'
    )
    RETURNING id INTO _system_listing_id;

    -- Create conversation
    INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
    VALUES (_system_listing_id, _recipient_user_id, auth.uid())
    RETURNING id INTO _conversation_id;
  END IF;

  -- Insert the message marked as system message
  INSERT INTO public.messages (conversation_id, sender_id, content, is_system_message)
  VALUES (_conversation_id, auth.uid(), _content, true)
  RETURNING id INTO _message_id;

  RETURN _message_id;
END;
$$;