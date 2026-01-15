import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@/data/listings";

type FavoriteRow = {
  listing_id: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    brand: string;
    year: string | null;
    location: string;
    images: string[] | null;
    created_at: string;
    view_count: number;
    status: string;
  } | null;
};

const Favorites = () => {
  const { user } = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          listing_id,
          created_at,
          listings (
            id,
            title,
            description,
            price,
            category,
            condition,
            brand,
            year,
            location,
            images,
            created_at,
            view_count,
            status
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data as FavoriteRow[] | null) || [])
        .filter((f) => f.listings && f.listings.status === "active")
        .map((f) => ({
          id: f.listings!.id,
          title: f.listings!.title,
          description: f.listings!.description,
          price: f.listings!.price,
          category: f.listings!.category,
          condition: f.listings!.condition,
          brand: f.listings!.brand,
          year: f.listings!.year || "",
          location: f.listings!.location,
          sellerName: "Säljare",
          sellerEmail: "",
          images: f.listings!.images || [],
          createdAt: f.listings!.created_at,
          viewCount: f.listings!.view_count,
        })) as Listing[];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Logga in för att se favoriter</h1>
            <p className="text-muted-foreground mb-6">
              Spara annonser du gillar och hitta dem enkelt här.
            </p>
            <Link to="/auth">
              <Button variant="glow">Logga in</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/browse" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold">Mina favoriter</h1>
              <p className="text-muted-foreground">
                {favorites.length} sparade annonser
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Inga favoriter ännu</h2>
              <p className="text-muted-foreground mb-6">
                Klicka på hjärtat på annonser du gillar för att spara dem här.
              </p>
              <Link to="/browse">
                <Button>Bläddra annonser</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
