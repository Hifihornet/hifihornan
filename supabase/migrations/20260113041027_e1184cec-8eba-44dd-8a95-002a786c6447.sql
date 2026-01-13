-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Allow view tracking inserts" ON public.listing_views;

-- Create a new INSERT policy that validates viewer_id
CREATE POLICY "Allow view tracking inserts" 
ON public.listing_views 
FOR INSERT 
WITH CHECK (
  -- Either viewer_id is NULL (anonymous user)
  viewer_id IS NULL 
  -- Or viewer_id matches the authenticated user
  OR viewer_id = auth.uid()
);