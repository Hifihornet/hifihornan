-- Enkel admin RPC function utan komplexa joins
CREATE OR REPLACE FUNCTION admin_get_profile_simple(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
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
    p.created_at,
    p.is_admin,
    p.is_verified_seller
  FROM profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Testa den
SELECT admin_get_profile_simple('79372846-e8b8-4d93-b2e7-0d80ebc0df4e');
