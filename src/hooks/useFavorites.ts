import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data.map((f) => f.listing_id));
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error("Du måste logga in för att spara favoriter");
      return;
    }

    setLoading(true);
    const isFavorited = favorites.includes(listingId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);

        if (error) throw error;
        setFavorites((prev) => prev.filter((id) => id !== listingId));
        toast.success("Borttagen från favoriter");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) throw error;
        setFavorites((prev) => [...prev, listingId]);
        toast.success("Tillagd i favoriter");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Kunde inte uppdatera favoriter");
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  return { favorites, toggleFavorite, isFavorite, loading, refetch: fetchFavorites };
};
