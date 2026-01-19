-- Skapa admin RPC function
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
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
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

-- Verifiera att den skapades
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'admin_get_profile_simple';
