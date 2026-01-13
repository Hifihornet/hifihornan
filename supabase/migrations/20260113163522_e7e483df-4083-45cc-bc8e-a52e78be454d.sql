-- Create a table to track site visits
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_ip_hash TEXT,
  visitor_id UUID,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (for tracking)
CREATE POLICY "Anyone can record visits"
ON public.site_visits
FOR INSERT
WITH CHECK (true);

-- Only admins can read visit data
CREATE POLICY "Admins can view visits"
ON public.site_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_site_visits_visited_at ON public.site_visits(visited_at);
CREATE INDEX idx_site_visits_visitor_ip_hash ON public.site_visits(visitor_ip_hash);

-- Function to record a site visit with rate limiting (one per hour per IP/user)
CREATE OR REPLACE FUNCTION public.record_site_visit(_page_path TEXT, _visitor_ip TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _viewer_id uuid;
  _ip_hash text;
  _recent_visit_exists boolean;
BEGIN
  _viewer_id := auth.uid();
  
  IF _visitor_ip IS NOT NULL THEN
    _ip_hash := encode(sha256(_visitor_ip::bytea), 'hex');
  END IF;
  
  -- Check for recent visit from same user/IP
  IF _viewer_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.site_visits
      WHERE visitor_id = _viewer_id
        AND visited_at > now() - interval '1 hour'
    ) INTO _recent_visit_exists;
  ELSIF _ip_hash IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.site_visits
      WHERE visitor_ip_hash = _ip_hash
        AND visited_at > now() - interval '1 hour'
    ) INTO _recent_visit_exists;
  ELSE
    _recent_visit_exists := false;
  END IF;
  
  IF _recent_visit_exists THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.site_visits (visitor_id, visitor_ip_hash, page_path)
  VALUES (_viewer_id, _ip_hash, _page_path);
  
  RETURN true;
END;
$$;

-- Function to get total visit stats (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_site_visit_stats()
RETURNS TABLE(total_visits BIGINT, unique_visitors BIGINT, visits_today BIGINT, visits_this_week BIGINT, visits_this_month BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to view site stats';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_visits,
    COUNT(DISTINCT COALESCE(visitor_id::text, visitor_ip_hash))::bigint as unique_visitors,
    COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE)::bigint as visits_today,
    COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE - interval '7 days')::bigint as visits_this_week,
    COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE - interval '30 days')::bigint as visits_this_month
  FROM public.site_visits;
END;
$$;

-- Cleanup function for old visits (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_site_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.site_visits
  WHERE visited_at < now() - interval '90 days';
END;
$$;