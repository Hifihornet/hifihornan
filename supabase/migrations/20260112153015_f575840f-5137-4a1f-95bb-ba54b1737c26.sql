-- Update search_profiles to include admins who have enabled searchability
CREATE OR REPLACE FUNCTION public.search_profiles(_search_term text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  location text,
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
    p.location,
    p.last_seen
  FROM public.profiles p
  WHERE p.is_searchable = true
    AND p.display_name IS NOT NULL
    AND (
      p.display_name ILIKE '%' || _search_term || '%'
      OR p.location ILIKE '%' || _search_term || '%'
    )
  ORDER BY p.display_name
  LIMIT 50;
$$;