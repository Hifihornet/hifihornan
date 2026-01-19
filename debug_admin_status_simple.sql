-- Kolla din admin-status
SELECT user_id, display_name, is_admin FROM profiles WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Kolla om auth.uid() matchar
SELECT auth.uid() as current_user_id;

-- Kolla om du är admin enligt RLS
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  ) THEN 'IS ADMIN' ELSE 'NOT ADMIN' END as admin_status;
