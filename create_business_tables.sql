-- Skapa tabell för företagsansökningar
CREATE TABLE IF NOT EXISTS business_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  description TEXT NOT NULL,
  org_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skapa tabell för godkända företag
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  description TEXT NOT NULL,
  org_number TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skapa RLS policies för business_applications
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON business_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON business_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert own applications" ON business_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update applications" ON business_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Skapa RLS policies för business_accounts
ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business account" ON business_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business accounts" ON business_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage business accounts" ON business_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Verifiera att tabellerna skapades
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('business_applications', 'business_accounts')
ORDER BY table_name;
