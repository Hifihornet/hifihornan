-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_public_profile_by_user_id(uuid);
DROP FUNCTION IF EXISTS public.admin_get_all_profiles_with_roles();

-- Recreate get_public_profile_by_user_id with is_verified_seller
CREATE FUNCTION public.get_public_profile_by_user_id(_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, display_name text, avatar_url text, bio text, setup_images text[], created_at timestamp with time zone, last_seen timestamp with time zone, is_verified_seller boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.setup_images,
    p.created_at,
    p.last_seen,
    p.is_verified_seller
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;
$function$;

-- Recreate admin_get_all_profiles_with_roles with is_verified_seller
CREATE FUNCTION public.admin_get_all_profiles_with_roles()
 RETURNS TABLE(id uuid, user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone, last_seen timestamp with time zone, listing_count bigint, roles text[], is_verified_seller boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ) as roles,
    p.is_verified_seller
  FROM public.profiles p
  ORDER BY p.created_at DESC;
$function$;

-- Create function to verify/unverify sellers (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_seller_verified(_user_id uuid, _verified boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to verify sellers';
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET is_verified_seller = _verified
  WHERE user_id = _user_id;

  -- Log the action
  INSERT INTO public.admin_activity_log (admin_id, action_type, target_type, target_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN _verified THEN 'verify_seller' ELSE 'unverify_seller' END,
    'user',
    _user_id::text,
    jsonb_build_object('verified', _verified)
  );
END;
$function$;