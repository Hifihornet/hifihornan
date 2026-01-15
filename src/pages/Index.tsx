import { Link } from "react-router-dom";
import { Search, ArrowRight, Disc, Radio, Speaker, Headphones, Users, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import AdBanner from "@/components/AdBanner";
import NewsletterSignup from "@/components/NewsletterSignup";
import { categories } from "@/data/listings";
import heroImage from "@/assets/hero-hifi.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useActiveVisitors } from "@/hooks/useActiveVisitors";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  // Force rebuild to reload env vars
  // Force rebuild 2
  const { user } = useAuth();
  const activeVisitors = useActiveVisitors();
  const { recentlyViewed } = useRecentlyViewed();
  
  const { data: listings = [] } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        year: item.year,
        location: item.location,
        sellerName: "Säljare",
        sellerEmail: "",
        images: item.images || [],
        createdAt: item.created_at,
        viewCount: item.view_count,
      }));
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: profileCount = 0 } = useQuery({
    queryKey: ["profile-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_profile_count");
      
      if (error) throw error;
      return data || 0;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const featuredListings = listings;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl lg:max-w-4xl">
            <span className="inline-block text-primary font-medium text-xs sm:text-sm lg:text-base uppercase tracking-wider mb-3 lg:mb-5 animate-fade-in-up">
              Din webplats för HiFi-Utrustning
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 lg:mb-8 animate-fade-in-up delay-100">
              Hitta din nästa{" "}
              <span className="text-gradient">klassiska HiFi</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 lg:mb-10 max-w-xl lg:max-w-2xl animate-fade-in-up delay-200">
              Köp och sälj vintage förstärkare, högtalare, skivspelare och mer. 
              Direkt mellan privatpersoner, utan mellanhänder.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-10 animate-fade-in-up delay-300">
              <div className="relative flex-1 max-w-md lg:max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
                <Input
                  placeholder="Sök bland annonser..."
                  className="pl-12 lg:pl-14 h-12 lg:h-14 text-base lg:text-lg"
                />
              </div>
              <Link to="/browse">
                <Button variant="glow" size="xl" className="w-full sm:w-auto text-base lg:text-lg px-6 lg:px-8">
                  Bläddra annonser
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-xs sm:text-sm lg:text-base text-muted-foreground animate-fade-in-up delay-400 flex-wrap">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-primary" />
                {listings.length} aktiva annonser
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                {profileCount} registrerade medlemmar
              </span>
              {activeVisitors > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 lg:h-2.5 lg:w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 lg:h-2.5 lg:w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-green-500 font-medium">{activeVisitors}</span> inne just nu
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 lg:mb-5">
              Bläddra efter kategori
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl lg:max-w-2xl mx-auto">
              Hitta exakt det du letar efter bland våra populära kategorier
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.slice(0, 8).map((category, index) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="group p-4 sm:p-5 lg:p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift text-center"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-display text-sm sm:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mt-8 lg:mt-14">
          <AdBanner slot="8997727388" format="horizontal" className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 lg:mb-14">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 lg:mb-4">
                Senaste annonser
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                Nyligen tillagda klassiska ljudprylar
              </p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="hidden sm:flex text-sm lg:text-base">
                Visa alla
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link to="/browse">
              <Button variant="outline">
                Visa alla annonser
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mt-8 lg:mt-14">
          <AdBanner slot="8997727388" format="horizontal" className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Recently Viewed Section - Only show if user has viewed listings */}
      {user && recentlyViewed.length > 0 && (
        <section className="py-12 sm:py-16 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Senast visade
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  to={`/listing/${item.id}`}
                  className="flex-shrink-0 w-48 bg-card rounded-lg border border-border overflow-hidden hover-lift"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-primary font-bold text-sm">
                      {item.price.toLocaleString("sv-SE")} kr
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 sm:gap-4 lg:gap-6 mb-4 lg:mb-8">
              <Disc className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary animate-pulse-glow" />
              <Radio className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-accent" />
              <Speaker className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary animate-pulse-glow" />
              <Headphones className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-accent" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 lg:mb-5">
              Har du HiFi att sälja?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 lg:mb-10 max-w-xl lg:max-w-2xl mx-auto">
              Lägg upp din ljudutrustning gratis och nå andra entusiaster 
              som letar efter precis det du har.
            </p>
            <Link to="/create">
              <Button variant="glow" size="xl" className="text-base lg:text-lg px-6 lg:px-10">
                Lägg upp gratis annons
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
