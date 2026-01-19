-- Generera ny token för befintlig inbjudan
UPDATE business_invitations 
SET 
  token = substr(md5(random()::text), 1, 15) || substr(md5(random()::text), 1, 15),
  expires_at = NOW() + INTERVAL '7 days',
  updated_at = NOW()
WHERE 
  email = 'test@gmail.com' -- Ersätt med företagets email
  AND status = 'pending';

-- Verifiera ny token
SELECT email, token, expires_at, updated_at 
FROM business_invitations 
WHERE email = 'test@gmail.com' AND status = 'pending';
