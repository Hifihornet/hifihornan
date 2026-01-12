-- Add validation constraints to profiles table
-- These match the client-side validation in Profile.tsx

-- Display name: 2-100 characters
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length 
  CHECK (display_name IS NULL OR char_length(display_name) BETWEEN 2 AND 100);

-- Location: 2-200 characters
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_location_length 
  CHECK (location IS NULL OR char_length(location) BETWEEN 2 AND 200);

-- Bio: max 2000 characters
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_length 
  CHECK (bio IS NULL OR char_length(bio) <= 2000);

-- Phone: basic format validation (optional, 7-20 characters with digits, spaces, dashes, and optional leading +)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_format 
  CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s-]{7,20}$');