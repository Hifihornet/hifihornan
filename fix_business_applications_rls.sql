-- Ta bort gamla policies
DROP POLICY IF EXISTS "Users can insert own applications" ON business_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON business_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON business_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON business_applications;

-- Skapa nya, korrekta policies
CREATE POLICY "Users can insert own applications" ON business_applications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can view own applications" ON business_applications
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

CREATE POLICY "Admins can view all applications" ON business_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update applications" ON business_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Verifiera policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'business_applications';
