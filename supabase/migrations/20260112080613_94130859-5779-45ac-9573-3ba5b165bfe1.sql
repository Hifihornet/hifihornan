-- Add bio and setup_images columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS setup_images text[] DEFAULT '{}';

-- Create storage bucket for setup images
INSERT INTO storage.buckets (id, name, public)
VALUES ('setup-images', 'setup-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own setup images
CREATE POLICY "Users can upload their own setup images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'setup-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own setup images
CREATE POLICY "Users can update their own setup images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'setup-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own setup images
CREATE POLICY "Users can delete their own setup images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'setup-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to setup images
CREATE POLICY "Setup images are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'setup-images');