-- Skapa en test function som inte kräver auth.uid()
CREATE OR REPLACE FUNCTION test_admin_rpc_no_auth(target_user_id UUID, current_admin_id UUID)
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
  -- Kontrollera att anroparen är admin (med explicit id)
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = current_admin_id
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

-- Testa den med ditt user_id
SELECT test_admin_rpc_no_auth('79372846-e8b8-4d93-b2e7-0d80ebc0df4e', '2998bdd8-41cf-41d3-a706-14ebd8ec7203');
