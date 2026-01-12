-- Fix admin_send_message_to_user to use valid price (1 instead of 0)
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
    -- Create a system listing for admin communications (price must be >= 1)
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
      1,
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