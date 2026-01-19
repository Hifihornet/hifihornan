-- Skapa tabell för företagsinbjudningar
CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL
);

-- Skapa RLS policies
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON business_invitations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invitations" ON business_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage invitations" ON business_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Index för token lookup
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(token);

-- Verifiera att tabellen skapades
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'business_invitations';
