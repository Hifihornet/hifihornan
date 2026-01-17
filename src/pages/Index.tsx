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
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { MobileOptimizedButton } from "@/components/ui/mobile-optimized-button";
import { MobileOptimizedInput } from "@/components/ui/mobile-optimized-input";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { CompactButton } from "@/components/ui/compact-button";
import { SEOHead } from "@/components/SEOHead";
import { useGamification } from "@/hooks/useGamification";

const Index = () => {
  // Force rebuild to reload env vars
  // Force rebuild 2
  const { user } = useAuth();
  const activeVisitors = useActiveVisitors();
  const { recentlyViewed } = useRecentlyViewed();
  
  // Scroll to top on route change
  useScrollToTop();
  
  // Mobile optimization
  const { isMobile, isTablet, getResponsiveClass, getResponsiveValue } = useMobileOptimization();
  
  // Gamification
  const { stats } = useGamification();
  
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
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sveriges största marknadsplats för HiFi-utrustning"
        description="Köp och sälj begagnad HiFi-utrustning hos tusentals entusiaster. Förstärkare, högtalare, skivspelare, receivers och mycket mer. Trygga affärer och bra priser."
        keywords="HiFi, ljud, förstärkare, högtalare, skivspelare, receivers, kassettdäck, CD-spelare, stereo, audio, sälja, köpa, begagnat, vintage, high-end"
        image="/og-home.jpg"
      />
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
          <div className={`max-w-2xl lg:max-w-4xl ${getResponsiveClass('text-center', 'text-center', 'text-center')}`}>
            <span className={`inline-block text-primary font-medium ${getResponsiveClass('text-xs', 'text-sm', 'text-base')} uppercase tracking-wider mb-3 lg:mb-5 animate-fade-in-up`}>
              Din webplats för HiFi-Utrustning
            </span>
            <h1 className={`font-display ${getResponsiveClass('text-3xl', 'text-4xl', 'text-6xl xl:text-7xl')} font-bold text-foreground mb-4 lg:mb-8 animate-fade-in-up delay-100`}>
              Hitta din nästa{" "}
              <span className="text-gradient">klassiska HiFi</span>
            </h1>
            <p className={`${getResponsiveClass('text-base', 'text-lg', 'text-xl xl:text-2xl')} text-muted-foreground mb-6 lg:mb-10 max-w-xl lg:max-w-2xl animate-fade-in-up delay-200`}>
              Köp och sälj vintage förstärkare, högtalare, skivspelare och mer. 
              Direkt mellan privatpersoner, utan mellanhänder.
            </p>

            <div className={`flex ${getResponsiveClass('flex-col', 'flex-col', 'flex-row')} gap-3 lg:gap-4 mb-6 lg:mb-10 animate-fade-in-up delay-300`}>
              <div className="relative flex-1 max-w-md lg:max-w-lg">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${getResponsiveClass('w-5 h-5', 'w-5 h-5', 'w-6 h-6')} text-muted-foreground`} />
                <MobileOptimizedInput
                  placeholder="Sök bland annonser..."
                  mobilePlaceholder="Sök..."
                  className="pl-12"
                />
              </div>
              <Link to="/browse">
                <CompactButton 
                  variant="default" 
                  size="default" 
                  mobileSize="sm"
                  className={getResponsiveClass('w-full', 'w-full', 'w-auto')}
                >
                  {isMobile ? 'Bläddra' : 'Bläddra'}
                  <ArrowRight className="w-4 h-4" />
                </CompactButton>
              </Link>
            </div>

            <div className={`flex items-center ${getResponsiveClass('gap-2', 'gap-3 md:gap-4', 'gap-4 lg:gap-6')} ${getResponsiveClass('text-xs', 'text-sm', 'text-base')} text-muted-foreground animate-fade-in-up delay-400 flex-wrap`}>
              <span className="flex items-center gap-2">
                <div className={`w-2 h-2 ${getResponsiveClass('w-2 h-2', 'w-2 h-2', 'w-2.5 h-2.5')} rounded-full bg-primary`} />
                {listings.length} aktiva annonser
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-2">
                <Users className={getResponsiveClass('w-4 h-4', 'w-4 h-4', 'w-5 h-5')} />
                {profileCount} registrerade medlemmar
              </span>
              {activeVisitors > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <span className={`relative flex ${getResponsiveClass('h-2 w-2', 'h-2 w-2', 'h-2.5 w-2.5')}`}>
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

      {/* Categories Section - Updated with compact buttons */}
          <section className="py-12 sm:py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-8 lg:mb-14`}>
            <h2 className={`font-display ${getResponsiveClass('text-2xl', 'text-3xl', 'text-4xl xl:text-5xl')} font-bold text-foreground mb-3 lg:mb-5`}>
              Bläddra efter kategori
            </h2>
            <p className={`${getResponsiveClass('text-sm', 'text-base', 'text-lg')} text-muted-foreground max-w-xl lg:max-w-2xl mx-auto`}>
              Hitta exakt det du letar efter bland våra populära kategorier
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 lg:gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="group w-full h-24 sm:h-28 lg:h-32 p-2 sm:p-2.5 rounded-md bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift text-center hover:shadow-sm hover:shadow-primary/10 flex flex-col items-center justify-center"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="text-xl sm:text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-display text-xs sm:text-xs lg:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 mt-auto">
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
          <div className={`flex items-end justify-between mb-8 lg:mb-14 ${getResponsiveClass('flex-col', 'flex-row', 'flex-row')} gap-4`}>
            <div>
              <h2 className={`font-display ${getResponsiveClass('text-2xl', 'text-3xl', 'text-4xl xl:text-5xl')} font-bold text-foreground mb-2 lg:mb-4`}>
                Senaste annonser
              </h2>
              <p className={`${getResponsiveClass('text-sm', 'text-base', 'text-lg')} text-muted-foreground`}>
                Nyligen tillagda klassiska ljudprylar
              </p>
            </div>
            <Link to="/browse">
              <CompactButton 
                variant="outline" 
                className={getResponsiveClass('hidden', 'flex', 'flex')}
                mobileSize="sm"
              >
                Visa alla
                <ArrowRight className="w-4 h-4" />
              </CompactButton>
            </Link>
          </div>

          <ResponsiveGrid
            mobileCols={1}
            tabletCols={3}
            desktopCols={4}
            gap={getResponsiveValue('gap-3', 'gap-4', 'gap-5')}
          >
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ResponsiveGrid>

          <div className={`mt-6 text-center ${getResponsiveClass('block', 'hidden', 'hidden')}`}>
            <Link to="/browse">
              <CompactButton 
                variant="outline" 
                mobileSize="sm"
              >
                Visa alla annonser
                <ArrowRight className="w-4 h-4" />
              </CompactButton>
            </Link>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mt-8 lg:mt-14">
          <AdBanner slot="8997727388" format="horizontal" className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-full">
                <span className="text-sm sm:text-base font-medium text-primary">Börja sälja idag</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 transition-all duration-300 hover:scale-110 hover:bg-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                  <Disc className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 transition-all duration-300 hover:scale-110 hover:bg-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 transition-all duration-300 hover:scale-110 hover:bg-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <Speaker className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 transition-all duration-300 hover:scale-110 hover:bg-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent" />
                </div>
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Har du <span className="text-gradient">HiFi</span> att sälja?
              </h2>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
                Lägg upp din ljudutrustning gratis och nå tusentals HiFi-entusiaster 
                som letar efter precis det du har.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/create">
                  <CompactButton variant="default" size="default" mobileSize="sm" className="px-6 lg:px-8">
                    Lägg upp gratis annons
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CompactButton>
                </Link>
                <Link to="/browse">
                  <CompactButton variant="outline" size="default" mobileSize="sm" className="px-6 lg:px-8">
                    Utforska annonser
                  </CompactButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
