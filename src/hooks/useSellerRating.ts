import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SellerRating {
  averageRating: number;
  reviewCount: number;
}

export const useSellerRating = (sellerId: string | null) => {
  const [rating, setRating] = useState<SellerRating>({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      if (!sellerId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_seller_rating", {
          _seller_id: sellerId,
        });

        if (error) throw error;
        if (data && data.length > 0) {
          setRating({
            averageRating: Number(data[0].average_rating) || 0,
            reviewCount: Number(data[0].review_count) || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching seller rating:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [sellerId]);

  return { ...rating, loading };
};
