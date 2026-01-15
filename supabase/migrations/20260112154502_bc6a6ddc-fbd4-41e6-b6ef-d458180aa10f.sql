-- Create table to track individual listing views for rate limiting
CREATE TABLE public.listing_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewer_id UUID, -- NULL for anonymous users
  viewer_ip_hash TEXT, -- Hashed IP for anonymous rate limiting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_listing_views_listing_viewer ON public.listing_views(listing_id, viewer_id);
CREATE INDEX idx_listing_views_listing_ip ON public.listing_views(listing_id, viewer_ip_hash);
CREATE INDEX idx_listing_views_created_at ON public.listing_views(created_at);

-- Enable RLS
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Allow inserts for rate limiting tracking (no select/update/delete needed for users)
CREATE POLICY "Allow view tracking inserts" 
ON public.listing_views 
FOR INSERT 
WITH CHECK (true);

-- Replace the increment function with rate-limited version
CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id uuid, viewer_ip text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _viewer_id uuid;
  _ip_hash text;
  _recent_view_exists boolean;
  _rate_limit_hours int := 24; -- One view per 24 hours
BEGIN
  -- Get current user (may be null for anonymous)
  _viewer_id := auth.uid();
  
  -- Hash the IP if provided (for anonymous users)
  IF viewer_ip IS NOT NULL THEN
    _ip_hash := encode(sha256(viewer_ip::bytea), 'hex');
  END IF;
  
  -- Check if this user/IP has viewed this listing recently
  IF _viewer_id IS NOT NULL THEN
    -- Check by user ID for authenticated users
    SELECT EXISTS (
      SELECT 1 FROM public.listing_views
      WHERE listing_views.listing_id = increment_listing_view.listing_id
        AND viewer_id = _viewer_id
        AND created_at > now() - interval '1 hour' * _rate_limit_hours
    ) INTO _recent_view_exists;
  ELSIF _ip_hash IS NOT NULL THEN
    -- Check by IP hash for anonymous users
    SELECT EXISTS (
      SELECT 1 FROM public.listing_views
      WHERE listing_views.listing_id = increment_listing_view.listing_id
        AND viewer_ip_hash = _ip_hash
        AND created_at > now() - interval '1 hour' * _rate_limit_hours
    ) INTO _recent_view_exists;
  ELSE
    -- No user ID or IP provided, allow the view but don't track
    -- This prevents blocking but also doesn't allow easy manipulation
    _recent_view_exists := false;
  END IF;
  
  -- If recently viewed, don't increment
  IF _recent_view_exists THEN
    RETURN false;
  END IF;
  
  -- Record this view
  INSERT INTO public.listing_views (listing_id, viewer_id, viewer_ip_hash)
  VALUES (increment_listing_view.listing_id, _viewer_id, _ip_hash);
  
  -- Increment the view count
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = increment_listing_view.listing_id;
  
  RETURN true;
END;
$$;

-- Create a cleanup function to remove old view records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_listing_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete views older than 48 hours (keep some buffer beyond rate limit)
  DELETE FROM public.listing_views
  WHERE created_at < now() - interval '48 hours';
END;
$$;