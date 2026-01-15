-- Add SELECT policy for listing_views that restricts access to admins only
CREATE POLICY "Admins can view listing views" 
ON public.listing_views 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));