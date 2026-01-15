-- Create a secure subscription function that prevents email enumeration
-- Always returns the same response regardless of whether email exists
CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase and trim
  _normalized_email := LOWER(TRIM(_email));
  
  -- Validate email format
  IF _normalized_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or do nothing if already exists - always returns success
  INSERT INTO public.newsletter_subscribers (email, is_active)
  VALUES (_normalized_email, true)
  ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    unsubscribed_at = NULL
  WHERE newsletter_subscribers.is_active = false;
  
  -- Always return true to prevent enumeration
  RETURN TRUE;
END;
$$;

-- Add unique constraint on email if not exists (for ON CONFLICT to work)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'newsletter_subscribers_email_key'
  ) THEN
    ALTER TABLE public.newsletter_subscribers 
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);
  END IF;
END $$;