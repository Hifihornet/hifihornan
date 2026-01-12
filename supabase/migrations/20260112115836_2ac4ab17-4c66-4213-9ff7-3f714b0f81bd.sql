-- Drop the existing overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a new restricted UPDATE policy that only allows users to update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);