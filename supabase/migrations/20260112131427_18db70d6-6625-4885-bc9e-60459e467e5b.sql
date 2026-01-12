-- Drop old function first
DROP FUNCTION IF EXISTS public.get_public_profile_by_user_id(uuid);

-- Recreate function with new return type including last_seen
CREATE FUNCTION public.get_public_profile_by_user_id(_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  display_name text, 
  avatar_url text, 
  bio text, 
  setup_images text[], 
  created_at timestamp with time zone,
  last_seen timestamp with time zone
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
    p.created_at,
    p.last_seen
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = now()
  WHERE user_id = _user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_last_seen(uuid) TO authenticated;