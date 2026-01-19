-- Testa att skapa en enkel admin function först
CREATE OR REPLACE FUNCTION test_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kontrollera att anroparen är admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Testa att köra den
SELECT test_admin_access();
