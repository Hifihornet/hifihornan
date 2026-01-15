-- Add 'store' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'store';

-- Create function for admin to create store accounts
CREATE OR REPLACE FUNCTION public.admin_create_store_account(
  _email text,
  _password text,
  _store_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_user_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to create store accounts';
  END IF;

  -- Create the new user in auth.users
  _new_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    aud,
    role
  )
  VALUES (
    _new_user_id,
    '00000000-0000-0000-0000-000000000000',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', _store_name),
    now(),
    now(),
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    _new_user_id,
    _new_user_id,
    _email,
    jsonb_build_object('sub', _new_user_id::text, 'email', _email),
    'email',
    now(),
    now(),
    now()
  );

  -- Assign store role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_new_user_id, 'store');

  RETURN _new_user_id;
END;
$$;