-- Create function for admins/creators to delete any listing
CREATE OR REPLACE FUNCTION public.admin_delete_listing(_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
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
    RAISE EXCEPTION 'Not authorized to delete listings';
  END IF;

  DELETE FROM public.listings WHERE id = _listing_id;
END;
$$;

-- Create function for admins to delete any user account
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can delete users
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to delete users';
  END IF;

  -- Delete messages where user is sender
  DELETE FROM public.messages WHERE sender_id = _user_id;
  
  -- Delete conversations where user is buyer or seller
  DELETE FROM public.conversations WHERE buyer_id = _user_id OR seller_id = _user_id;
  
  -- Delete listings
  DELETE FROM public.listings WHERE user_id = _user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Create function to get all listings for admin
CREATE OR REPLACE FUNCTION public.admin_get_all_listings()
RETURNS TABLE(
  id uuid,
  title text,
  user_id uuid,
  status text,
  created_at timestamp with time zone,
  seller_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.title,
    l.user_id,
    l.status,
    l.created_at,
    COALESCE(p.display_name, 'Okänd') as seller_name
  FROM public.listings l
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  ORDER BY l.created_at DESC;
$$;

-- Create function to get all profiles for admin
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone,
  last_seen timestamp with time zone,
  listing_count bigint
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
    (SELECT COUNT(*) FROM public.listings WHERE listings.user_id = p.user_id) as listing_count
  FROM public.profiles p
  ORDER BY p.created_at DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_delete_listing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;