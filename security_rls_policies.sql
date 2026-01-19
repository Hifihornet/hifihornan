-- ============================================
-- HiFiHörnet - Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON messages;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- LISTINGS TABLE POLICIES
-- ============================================

-- Anyone can view all listings (public marketplace)
CREATE POLICY "Anyone can view all listings" ON listings
  FOR SELECT USING (true);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================

-- Users can view conversations they are part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can insert conversations (as buyer)
CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update conversations they are part of
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Users can insert messages in conversations they are part of
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- ============================================
-- ADMIN OVERRIDE (Optional - for admin users)
-- ============================================

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin role in profiles table
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = is_admin.user_id 
    AND is_admin = true
  );
END;
$$;

-- Admin policies (override all restrictions)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all listings" ON listings
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all listings" ON listings
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all conversations" ON conversations
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all messages" ON messages
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION
-- ============================================

-- Simple verification - just check if policies exist
SELECT 
  'profiles' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
UNION ALL
SELECT 
  'listings' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'listings' AND schemaname = 'public'
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'messages' AND schemaname = 'public'
UNION ALL
SELECT 
  'conversations' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'conversations' AND schemaname = 'public'
ORDER BY table_name;

-- Check all policies details
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
