-- Update RLS policy for listings to handle 'sold' and 'hidden' statuses
-- Sold listings are visible but marked, hidden listings only visible to admins and owner

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;

CREATE POLICY "Listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING (
  -- Show active and sold listings to everyone
  (status IN ('active', 'sold', 'system'))
  OR 
  -- Show hidden listings only to owner
  (auth.uid() = user_id)
  OR
  -- Admins and moderators can see all listings
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  ))
);

-- Allow admins to update any listing (for hiding)
DROP POLICY IF EXISTS "Admins can update any listing" ON public.listings;

CREATE POLICY "Admins can update any listing"
ON public.listings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
);