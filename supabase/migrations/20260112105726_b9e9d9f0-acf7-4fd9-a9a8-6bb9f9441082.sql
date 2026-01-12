-- Drop the security definer view and recreate with security invoker
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with SECURITY INVOKER (default, safer)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
  SELECT 
    id,
    user_id,
    display_name,
    avatar_url,
    bio,
    setup_images,
    created_at
  FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a policy that allows everyone to view basic profile info via direct query
-- This complements the view approach for cases where the view isn't used
CREATE POLICY "Everyone can view basic profile info"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);