-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;

-- Create new policy that also allows viewing system listings
CREATE POLICY "Listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING ((status = 'active'::text) OR (status = 'system'::text) OR (auth.uid() = user_id));