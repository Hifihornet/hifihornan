-- Sätt dig som admin
UPDATE profiles SET is_admin = true WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Verifiera att du nu är admin
SELECT user_id, display_name, is_admin FROM profiles WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Testa admin-kontrollen igen
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  ) THEN 'IS ADMIN' ELSE 'NOT ADMIN' END as admin_status;
