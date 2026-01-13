-- Drop the foreign key constraint on conversations.listing_id to allow NULL for support chats
ALTER TABLE public.conversations 
ALTER COLUMN listing_id DROP NOT NULL;

-- Update RLS policy to allow creating support conversations (where listing_id is NULL)
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);