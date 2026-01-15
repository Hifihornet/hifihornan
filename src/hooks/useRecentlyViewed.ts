import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RecentlyViewedListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  location: string;
  viewed_at: string;
}

type RecentlyViewedRow = {
  listing_id: string;
  viewed_at: string;
  listings: {
    id: string;
    title: string;
    price: number;
    images: string[] | null;
    category: string;
    location: string;
    status: string;
  } | null;
};

export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedListing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentlyViewed = useCallback(async () => {
    if (!user) {
      setRecentlyViewed([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select(`
          listing_id,
          viewed_at,
          listings (
            id,
            title,
            price,
            images,
            category,
            location,
            status
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const listings = ((data as RecentlyViewedRow[] | null) || [])
        .filter((item) => item.listings && item.listings.status === "active")
        .map((item) => ({
          id: item.listings!.id,
          title: item.listings!.title,
          price: item.listings!.price,
          images: item.listings!.images || [],
          category: item.listings!.category,
          location: item.listings!.location,
          viewed_at: item.viewed_at,
        }));

      setRecentlyViewed(listings);
    } catch (err) {
      console.error("Error fetching recently viewed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecentlyViewed();
  }, [fetchRecentlyViewed]);

  const addToRecentlyViewed = async (listingId: string) => {
    if (!user) return;

    try {
      // Delete existing entry for this listing to update timestamp
      await supabase
        .from("recently_viewed")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);

      // Insert new entry
      await supabase
        .from("recently_viewed")
        .insert({ user_id: user.id, listing_id: listingId });
    } catch (err) {
      console.error("Error adding to recently viewed:", err);
    }
  };

  return { recentlyViewed, loading, addToRecentlyViewed, refetch: fetchRecentlyViewed };
};
