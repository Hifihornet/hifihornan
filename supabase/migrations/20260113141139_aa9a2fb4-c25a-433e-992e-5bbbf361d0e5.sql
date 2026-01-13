-- Add SELECT policy for newsletter_subscribers to restrict access to admins only
CREATE POLICY "Only admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));