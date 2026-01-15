-- Allow conversation participants to delete conversations
CREATE POLICY "Participants can delete conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Allow admins to update broadcast messages
CREATE POLICY "Admins can update broadcasts" 
ON public.broadcast_messages 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Allow admins to delete broadcast messages
CREATE POLICY "Admins can delete broadcasts" 
ON public.broadcast_messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));