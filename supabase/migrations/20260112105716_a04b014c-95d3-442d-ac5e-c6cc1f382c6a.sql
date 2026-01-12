-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a policy that allows users to see their own full profile
CREATE POLICY "Users can view their own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create a view for public profile data that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT 
    id,
    user_id,
    display_name,
    avatar_url,
    bio,
    setup_images,
    created_at
  FROM public.profiles;

-- Grant access to the view for all users
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create a policy that allows everyone to view non-sensitive profile fields
-- This uses a security definer function to bypass RLS for the view
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
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
    id,
    user_id,
    display_name,
    avatar_url,
    bio,
    setup_images,
    created_at
  FROM public.profiles
  WHERE profiles.user_id = _user_id
  LIMIT 1;
$$;