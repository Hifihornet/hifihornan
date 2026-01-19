import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminProfile {
  user_id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  is_admin: boolean;
  is_verified_seller: boolean;
}

export interface AdminListing {
  id: string;
  title: string;
  price: number;
  status: string;
  user_id: string;
  created_at: string;
  seller_name: string;
}

export interface AdminMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllProfiles = async (): Promise<AdminProfile[]> => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_profiles');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllListings = async (): Promise<AdminListing[]> => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_listings');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllMessages = async (): Promise<AdminMessage[]> => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_messages');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string): Promise<AdminProfile | null> => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const { data, error } = await supabase.rpc('admin_get_profile', { target_user_id: userId });
      
      if (error) throw error;
      
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    loading,
    error,
    getAllProfiles,
    getAllListings,
    getAllMessages,
    getProfile,
  };
};
