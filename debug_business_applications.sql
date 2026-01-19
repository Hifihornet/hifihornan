-- Kolla RLS policies för business_applications
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

-- Kolla om användaren har rätt att inserta
SELECT 
  has_table_privilege('business_applications', 'INSERT') as can_insert,
  has_table_privilege('business_applications', 'SELECT') as can_select;

-- Testa att infoga manuellt (som admin)
INSERT INTO business_applications (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  website,
  description,
  org_number,
  status
) VALUES (
  '2998bdd8-41cf-41d3-a706-14ebd8ec7203',
  'Testföretag AB',
  'Test Person',
  'test@test.se',
  '070-123 45 67',
  'Testgatan 1, 12345 Stad',
  'https://test.se',
  'Test beskrivning',
  '556123-4567',
  'pending'
);

-- Kolla om det funkade
SELECT * FROM business_applications ORDER BY created_at DESC LIMIT 1;
