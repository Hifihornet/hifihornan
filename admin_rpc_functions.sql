-- Admin RPC Functions - SECURITY DEFINER för att bypassa RLS

-- Funktion för att hämta alla profiler (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  is_admin BOOLEAN,
  is_verified_seller BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kontrollera att anroparen är admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Returnera alla profiler
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    u.email,
    p.created_at,
    p.is_admin,
    p.is_verified_seller
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Funktion för att hämta alla annonser (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_listings()
RETURNS TABLE (
  id UUID,
  title TEXT,
  price DECIMAL,
  status TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  seller_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kontrollera att anroparen är admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Returnera alla annonser
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.price,
    l.status,
    l.user_id,
    l.created_at,
    l.seller_name
  FROM listings l
  ORDER BY l.created_at DESC;
END;
$$;

-- Funktion för att hämta alla meddelanden (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_messages()
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_id UUID,
  conversation_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kontrollera att anroparen är admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Returnera alla meddelanden
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.sender_id,
    m.conversation_id,
    m.created_at
  FROM messages m
  ORDER BY m.created_at DESC;
END;
$$;

-- Funktion för att hämta specifik profil (admin only)
CREATE OR REPLACE FUNCTION admin_get_profile(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  is_admin BOOLEAN,
  is_verified_seller BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kontrollera att anroparen är admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Returnera specifik profil
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    u.email,
    p.created_at,
    p.is_admin,
    p.is_verified_seller
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.user_id = target_user_id;
END;
$$;
