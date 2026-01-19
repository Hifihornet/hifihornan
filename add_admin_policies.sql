-- Lägg till admin policies utan recursion
-- Använder auth.uid() direkt istället för EXISTS queries

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can view all listings" ON listings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can manage all listings" ON listings
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can manage all conversations" ON conversations
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    )
  );

-- Verifiera att policies är skapade
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'listings', 'messages', 'conversations')
ORDER BY tablename, policyname;
