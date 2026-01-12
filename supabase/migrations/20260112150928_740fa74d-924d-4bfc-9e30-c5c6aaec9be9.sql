-- Create function to get all profiles with their roles for admin view
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles_with_roles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone,
  last_seen timestamp with time zone,
  listing_count bigint,
  roles text[]
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
    p.created_at,
    p.last_seen,
    (SELECT COUNT(*) FROM public.listings WHERE listings.user_id = p.user_id) as listing_count,
    COALESCE(
      (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = p.user_id),
      '{}'::text[]
    ) as roles
  FROM public.profiles p
  ORDER BY p.created_at DESC;
$$;