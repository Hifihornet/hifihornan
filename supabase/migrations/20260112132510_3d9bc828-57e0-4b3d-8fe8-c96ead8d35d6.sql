-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Roles are viewable by everyone" ON public.user_roles;

-- Create a new restrictive policy - users can only view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);