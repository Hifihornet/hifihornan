-- Create a secure function to check if any user is a store account
-- This bypasses RLS so anyone can check store status
CREATE OR REPLACE FUNCTION public.is_store_account(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'store'
  )
$$;