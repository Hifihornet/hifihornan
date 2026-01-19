-- Kolla företagsansökningar
SELECT 
  company_name, 
  status, 
  admin_notes, 
  created_at, 
  updated_at 
FROM business_applications 
ORDER BY updated_at DESC 
LIMIT 5;

-- Kolla inbjudningar
SELECT 
  email, 
  company_name, 
  token, 
  status, 
  created_at, 
  expires_at 
FROM business_invitations 
ORDER BY created_at DESC 
LIMIT 5;

-- Kolla godkända företag
SELECT 
  company_name, 
  contact_name, 
  is_verified, 
  created_at 
FROM business_accounts 
ORDER BY created_at DESC 
LIMIT 5;
