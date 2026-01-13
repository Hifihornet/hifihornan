-- Fix: Add role authorization checks to admin view functions
-- Issue: admin_get_all_listings() and admin_get_all_profiles() bypass RLS but don't verify admin privileges

-- Replace admin_get_all_listings with role-checked version
CREATE OR REPLACE FUNCTION public.admin_get_all_listings()
RETURNS TABLE(id uuid, title text, user_id uuid, status text, created_at timestamp with time zone, seller_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin, moderator, or creator role
  IF NOT (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'moderator') OR 
    has_role(auth.uid(), 'creator')
  ) THEN
    RAISE EXCEPTION 'Not authorized to view all listings';
  END IF;

  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.user_id,
    l.status,
    l.created_at,
    COALESCE(p.display_name, 'Okänd')::text as seller_name
  FROM public.listings l
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  ORDER BY l.created_at DESC;
END;
$$;

-- Replace admin_get_all_profiles with role-checked version
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(id uuid, user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone, last_seen timestamp with time zone, listing_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin or moderator role
  IF NOT (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'moderator')
  ) THEN
    RAISE EXCEPTION 'Not authorized to view all profiles';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.created_at,
    p.last_seen,
    (SELECT COUNT(*) FROM public.listings WHERE listings.user_id = p.user_id) as listing_count
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;