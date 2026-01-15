-- Add columns to profiles table for searchability and direct messaging preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_searchable boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_direct_messages boolean NOT NULL DEFAULT true;

-- Create a function to search public profiles
CREATE OR REPLACE FUNCTION public.search_profiles(_search_term text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  last_seen timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.last_seen
  FROM public.profiles p
  WHERE p.is_searchable = true
    AND p.display_name IS NOT NULL
    AND (
      p.display_name ILIKE '%' || _search_term || '%'
      OR p.location ILIKE '%' || _search_term || '%'
    )
    -- Exclude admins from search results
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = p.user_id AND ur.role = 'admin'
    )
  ORDER BY p.display_name
  LIMIT 50;
$$;

-- Create a function to check if a user allows direct messages
CREATE OR REPLACE FUNCTION public.get_user_messaging_preferences(_user_id uuid)
RETURNS TABLE(
  allow_direct_messages boolean,
  is_admin boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.allow_direct_messages, true),
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.role = 'admin')
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- Create a function to send direct message to a user (creates a system listing if needed)
CREATE OR REPLACE FUNCTION public.send_direct_message_to_user(_recipient_user_id uuid, _content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conversation_id uuid;
  _message_id uuid;
  _system_listing_id uuid;
  _sender_name text;
BEGIN
  -- Check if recipient allows direct messages
  IF NOT (SELECT allow_direct_messages FROM public.profiles WHERE user_id = _recipient_user_id) THEN
    RAISE EXCEPTION 'User does not accept direct messages';
  END IF;

  -- Check if recipient is admin (can't message admins directly)
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _recipient_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot send direct messages to administrators';
  END IF;

  -- Get sender name
  SELECT display_name INTO _sender_name FROM public.profiles WHERE user_id = auth.uid();

  -- Look for existing direct message conversation between these users
  SELECT c.id INTO _conversation_id
  FROM public.conversations c
  INNER JOIN public.listings l ON l.id = c.listing_id
  WHERE l.status = 'direct_message'
    AND ((c.buyer_id = auth.uid() AND c.seller_id = _recipient_user_id)
      OR (c.seller_id = auth.uid() AND c.buyer_id = _recipient_user_id))
  LIMIT 1;

  -- If no conversation exists, create a placeholder listing and conversation
  IF _conversation_id IS NULL THEN
    -- Create a direct message listing
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
      'Direktmeddelande från ' || COALESCE(_sender_name, 'Användare'),
      'Direktmeddelande',
      'Övrigt',
      'Direktmeddelande',
      'Nytt',
      1,
      'System',
      'direct_message'
    )
    RETURNING id INTO _system_listing_id;

    -- Create conversation with sender as seller, recipient as buyer
    INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
    VALUES (_system_listing_id, _recipient_user_id, auth.uid())
    RETURNING id INTO _conversation_id;
  END IF;

  -- Insert the message
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (_conversation_id, auth.uid(), _content)
  RETURNING id INTO _message_id;

  RETURN _message_id;
END;
$$;