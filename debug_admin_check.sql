-- Kolla vad auth.uid() returnerar
SELECT auth.uid() as current_user_id;

-- Kolla din profil igen
SELECT user_id, display_name, is_admin FROM profiles WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Kolla om auth.uid() matchar din profil
SELECT 
  auth.uid() as current_user_id,
  p.user_id,
  p.display_name,
  p.is_admin,
  CASE WHEN auth.uid() = p.user_id THEN 'MATCH' ELSE 'NO MATCH' END as match_status
FROM profiles p
WHERE p.user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Testa admin-kontrollen direkt
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  ) THEN 'IS ADMIN' ELSE 'NOT ADMIN' END as admin_status;
