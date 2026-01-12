-- Create function to get profile count (public)
CREATE OR REPLACE FUNCTION public.get_profile_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.profiles;
$$;