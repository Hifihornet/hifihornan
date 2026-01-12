-- Create a secure function to get user roles that bypasses RLS
-- This allows anyone to check another user's roles for display purposes
CREATE OR REPLACE FUNCTION public.get_user_roles_public(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(role::text), '{}')
  FROM public.user_roles
  WHERE user_id = _user_id
$$;