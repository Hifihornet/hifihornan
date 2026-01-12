-- Create a broadcast_messages table for admin announcements
CREATE TABLE public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read broadcast messages
CREATE POLICY "Everyone can view broadcasts" 
ON public.broadcast_messages 
FOR SELECT 
USING (true);

-- Only admins can create broadcasts
CREATE POLICY "Admins can create broadcasts" 
ON public.broadcast_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function for admin to send broadcast
CREATE OR REPLACE FUNCTION public.admin_send_broadcast(_title text, _content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _broadcast_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to send broadcasts';
  END IF;

  -- Insert broadcast message
  INSERT INTO public.broadcast_messages (sender_id, title, content)
  VALUES (auth.uid(), _title, _content)
  RETURNING id INTO _broadcast_id;

  RETURN _broadcast_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_send_broadcast(text, text) TO authenticated;