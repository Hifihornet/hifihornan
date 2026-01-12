-- Add view_count column to listings table
ALTER TABLE public.listings 
ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create a function to increment view count (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = listing_id;
END;
$$;