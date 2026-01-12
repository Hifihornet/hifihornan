-- Add validation constraints to listings table
ALTER TABLE public.listings
  ADD CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  ADD CONSTRAINT description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 5000),
  ADD CONSTRAINT brand_length CHECK (char_length(brand) >= 1 AND char_length(brand) <= 100),
  ADD CONSTRAINT location_length CHECK (char_length(location) >= 2 AND char_length(location) <= 200),
  ADD CONSTRAINT price_range CHECK (price > 0 AND price <= 10000000),
  ADD CONSTRAINT year_format CHECK (year IS NULL OR year ~ '^\d{4}$');