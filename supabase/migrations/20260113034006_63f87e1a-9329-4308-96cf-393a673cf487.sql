-- Update conversation SELECT policy to allow admins to view support conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  (auth.uid() = buyer_id) OR 
  (auth.uid() = seller_id) OR 
  (listing_id IS NULL AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  ))
);

-- Update conversation UPDATE policy to allow admins to update support conversations
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (auth.uid() = buyer_id) OR 
  (auth.uid() = seller_id) OR 
  (listing_id IS NULL AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  ))
);

-- Update messages SELECT policy to allow admins to view support messages
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
CREATE POLICY "Conversation participants can view messages" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (
      (conversations.buyer_id = auth.uid()) OR 
      (conversations.seller_id = auth.uid()) OR
      (conversations.listing_id IS NULL AND EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('admin', 'moderator')
      ))
    )
  )
);

-- Update messages INSERT policy to allow admins to send support messages
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
CREATE POLICY "Conversation participants can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (
      (conversations.buyer_id = auth.uid()) OR 
      (conversations.seller_id = auth.uid()) OR
      (conversations.listing_id IS NULL AND EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('admin', 'moderator')
      ))
    )
  )
);