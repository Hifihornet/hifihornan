-- Kolla om RPC functions finns
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'admin_%'
ORDER BY routine_name;

-- Kolla om den specifika function finns
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'admin_get_profile_simple';

-- Testa att köra den direkt
SELECT admin_get_profile_simple('79372846-e8b8-4d93-b2e7-0d80ebc0df4e');
