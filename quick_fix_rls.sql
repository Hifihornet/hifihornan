-- SNABB FIX: Tillåt alla att inserta (testning)
DROP POLICY IF EXISTS "Users can insert own applications" ON business_applications;

CREATE POLICY "Allow all insert for testing" ON business_applications
  FOR INSERT WITH CHECK (true);

-- Verifiera
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'business_applications';
