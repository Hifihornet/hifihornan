-- Kolla senaste godkända ansökan
SELECT 
  company_name,
  status,
  admin_notes,
  updated_at
FROM business_applications 
WHERE status = 'approved'
ORDER BY updated_at DESC 
LIMIT 1;

-- Kolla motsvarande inbjudan
SELECT 
  email,
  company_name,
  token,
  status,
  created_at
FROM business_invitations 
ORDER BY created_at DESC 
LIMIT 1;
