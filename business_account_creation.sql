-- Skapa användarkonto för företag vid godkännande
CREATE OR REPLACE FUNCTION create_business_account_for_application(application_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  new_user_id UUID;
  temp_password TEXT;
BEGIN
  -- Hämta ansökan
  SELECT * INTO app_record 
  FROM business_applications 
  WHERE id = application_id AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Ansökan hittades inte eller är inte godkänd';
    RETURN;
  END IF;
  
  -- Skapa användare i auth.users
  temp_password := substr(md5(random()::text), 1, 12);
  
  INSERT INTO auth.users (email, email_confirmed_at, created_at)
  VALUES (app_record.contact_email, NOW(), NOW())
  RETURNING id INTO new_user_id;
  
  -- Skapa profil
  INSERT INTO profiles (
    user_id, 
    display_name, 
    email, 
    is_verified_seller,
    created_at
  ) VALUES (
    new_user_id,
    app_record.company_name,
    app_record.contact_email,
    true,
    NOW()
  );
  
  -- Flytta till business_accounts
  INSERT INTO business_accounts (
    user_id,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    address,
    website,
    description,
    org_number,
    is_verified,
    created_at
  ) VALUES (
    new_user_id,
    app_record.company_name,
    app_record.contact_name,
    app_record.contact_email,
    app_record.contact_phone,
    app_record.address,
    app_record.website,
    app_record.description,
    app_record.org_number,
    true,
    NOW()
  );
  
  -- Uppdatera ansökan
  UPDATE business_applications 
  SET status = 'completed',
      admin_notes = admin_notes || chr(10) || 'Konto skapat: ' || NOW(),
      updated_at = NOW()
  WHERE id = application_id;
  
  RETURN QUERY SELECT true, new_user_id, 'Konto skapat för ' || app_record.company_name;
END;
$$;
