import React from 'react';
import { Link } from 'react-router-dom';
import { Disc, ArrowRight, Search, Filter, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const PublicVinylHyllan = () => {
  const { user } = useAuth();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["public-vinyl-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .eq("category", "vinyl")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        year: item.year,
        location: item.location,
        sellerName: item.user_id === user?.id ? "Min annons" : "Säljare",
        sellerEmail: "",
        images: item.images || [],
        createdAt: item.created_at,
        viewCount: item.view_count,
      }));
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <Disc className="w-16 h-16 text-white mr-4" />
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
                Vinylhyllan
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-purple-200 mb-8 max-w-3xl mx-auto">
              Upptäck vinyl från privatpersoner över hela Sverige. 
              Från klassiska rock till obskyra jazz-favoriter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <Input
                  placeholder="Sök bland vinyl-annonser..."
                  className="pl-12 h-12 text-base bg-white/10 border-white/20 text-white placeholder-purple-300"
                />
              </div>
              <Button variant="secondary" size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-purple-200">
              <span className="flex items-center gap-2">
                <Disc className="w-5 h-5" />
                {listings.length} vinyl-annonser
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Hela Sverige
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Uppdateras dagligen
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-muted-foreground">Laddar vinyl-annonser...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Disc className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Inga vinyl-annonser just nu</h3>
              <p className="text-muted-foreground mb-6">
                Kom tillbaka senare för att se nya vinyl-tillskott
              </p>
              <Link to="/browse">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Se alla annonser
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Senaste vinyl-annonser ({listings.length})
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Sortera
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {listings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg" className="px-8">
                  Ladda fler annonser
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vill du sälja din vinyl?
          </h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Nå ut till tusentals HiFi-entusiaster och sälj dina vinyl-skivor direkt. 
            Gratis att annonsera, inga mellanhänder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/create" : "/auth"}>
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                <Disc className="w-5 h-5 mr-2" />
                {user ? "Sälj din vinyl" : "Logga in för att sälja"}
              </Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-900">
                <ArrowRight className="w-5 h-5 mr-2" />
                Bläddra alla annonser
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicVinylHyllan;
