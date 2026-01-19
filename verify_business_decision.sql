-- Kolla status i business_applications
SELECT 
  id,
  company_name,
  status,
  admin_notes,
  created_at,
  updated_at
FROM business_applications 
ORDER BY updated_at DESC 
LIMIT 5;

-- Kolla om godkända finns i business_accounts
SELECT 
  id,
  user_id,
  company_name,
  contact_name,
  is_verified,
  created_at
FROM business_accounts 
ORDER BY created_at DESC 
LIMIT 5;

-- Kolla specifik ansökan (ersätt med ditt id)
SELECT * FROM business_applications WHERE company_name LIKE '%Test%' ORDER BY created_at DESC;
