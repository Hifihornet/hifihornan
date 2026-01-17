import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  image: string;
  viewed_at: string;
}

export const useRecentlyViewed = (userId?: string) => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addToRecentlyViewed = async (listing: any) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('recently_viewed')
        .upsert({
          user_id: userId,
          listing_id: listing.id,
          title: listing.title,
          price: listing.price,
          image: listing.images?.[0] || '',
        });

      if (error) {
        console.error('Error adding to recently viewed:', error);
      }
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const fetchRecentlyViewed = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recently viewed:', error);
        return;
      }

      // Map database fields to RecentlyViewedItem interface
      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        viewed_at: item.viewed_at
      }));

      setRecentlyViewed(mappedData);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecentlyViewed();
    }
  }, [userId]);

  return {
    recentlyViewed,
    loading,
    addToRecentlyViewed,
    fetchRecentlyViewed,
  };
};
