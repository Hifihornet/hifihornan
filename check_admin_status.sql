-- Kolla din admin-status
SELECT user_id, display_name, is_admin FROM profiles WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Kolla alla admin-användare
SELECT user_id, display_name, is_admin FROM profiles WHERE is_admin = true;

-- Sätt dig som admin om det behövs
UPDATE profiles SET is_admin = true WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';

-- Verifiera igen
SELECT user_id, display_name, is_admin FROM profiles WHERE user_id = '2998bdd8-41cf-41d3-a706-14ebd8ec7203';
