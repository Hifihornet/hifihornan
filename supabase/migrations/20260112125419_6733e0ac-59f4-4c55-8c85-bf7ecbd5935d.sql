-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the account owner
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  -- Delete messages where user is sender
  DELETE FROM public.messages WHERE sender_id = _user_id;
  
  -- Delete conversations where user is buyer or seller
  DELETE FROM public.conversations WHERE buyer_id = _user_id OR seller_id = _user_id;
  
  -- Delete listings
  DELETE FROM public.listings WHERE user_id = _user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Delete the auth user (this will cascade to other tables with FK references)
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;