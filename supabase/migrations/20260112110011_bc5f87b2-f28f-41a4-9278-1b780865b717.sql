-- Drop the overly permissive policy that exposes phone field
DROP POLICY IF EXISTS "Everyone can view basic profile info" ON public.profiles;

-- The public_profiles view with security_invoker = true will now 
-- only work for authenticated users viewing their own profile via 
-- the "Users can view their own full profile" policy

-- Create a security definer function to safely fetch public profile data
-- This allows anyone to get non-sensitive profile info without exposing phone
CREATE OR REPLACE FUNCTION public.get_public_profile_by_user_id(_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  setup_images text[],
  created_at timestamptz
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
    p.setup_images,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_user_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_user_id(uuid) TO authenticated;