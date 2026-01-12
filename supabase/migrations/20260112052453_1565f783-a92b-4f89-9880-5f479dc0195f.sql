-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create a security definer function to safely get seller display name
-- This avoids exposing the full profiles table
CREATE OR REPLACE FUNCTION public.get_seller_display_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1;
$$;