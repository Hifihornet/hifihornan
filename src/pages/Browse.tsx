import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2, Filter, ArrowUpDown, Grid, List, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CategoryFilter from "@/components/CategoryFilter";
import AdBanner from "@/components/AdBanner";
import { conditions, Listing } from "@/data/listings";
import { supabase } from "@/integrations/supabase/client";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { SkeletonCard, SkeletonText, SkeletonButton } from "@/components/ui/skeleton-card";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { MobileOptimizedButton } from "@/components/ui/mobile-optimized-button";
import { MobileOptimizedInput } from "@/components/ui/mobile-optimized-input";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { CompactButton } from "@/components/ui/compact-button";

interface ListingWithStore extends Listing {
  userId?: string;
  isStore?: boolean;
}

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_low" | "price_high">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [dbListings, setDbListings] = useState<ListingWithStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scroll to top on route change
  useScrollToTop();
  
  // Mobile optimization
  const { isMobile, isTablet, getResponsiveClass, getResponsiveValue } = useMobileOptimization();
  
  // Error handling
  const { showError, showSuccess } = useErrorToast();

  const selectedCategory = searchParams.get("category") || null;

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching listings:", error);
        } else if (data) {
          // Check which sellers are store accounts
          const uniqueUserIds = [...new Set(data.map(item => item.user_id))];
          const storeStatusMap: Record<string, boolean> = {};
          
          for (const userId of uniqueUserIds) {
            const { data: isStore } = await supabase.rpc('is_store_account', { _user_id: userId });
            storeStatusMap[userId] = isStore || false;
          }

          const formattedListings: ListingWithStore[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            condition: item.condition,
            brand: item.brand,
            year: item.year || "",
            location: item.location,
            sellerName: "Säljare",
            sellerEmail: "",
            images: item.images || [],
            createdAt: item.created_at,
            viewCount: item.view_count,
            userId: item.user_id,
            isStore: storeStatusMap[item.user_id] || false,
          }));
          setDbListings(formattedListings);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Kunde inte ladda annonser");
        showError("Kunde inte ladda annonser", "Försök igen om en stund");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("listings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger refetch by updating a dummy state
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching listings:", error);
          setError("Kunde inte ladda annonser");
          showError("Kunde inte ladda annonser", "Försök igen om en stund");
        } else if (data) {
          // Check which sellers are store accounts
          const uniqueUserIds = [...new Set(data.map(item => item.user_id))];
          const storeStatusMap: Record<string, boolean> = {};
          
          for (const userId of uniqueUserIds) {
            const { data: isStore } = await supabase.rpc('is_store_account', { _user_id: userId });
            storeStatusMap[userId] = isStore || false;
          }

          const formattedListings: ListingWithStore[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            condition: item.condition,
            brand: item.brand,
            year: item.year || "",
            location: item.location,
            sellerName: "Säljare",
            sellerEmail: "",
            images: item.images || [],
            createdAt: item.created_at,
            viewCount: item.view_count,
            userId: item.user_id,
            isStore: storeStatusMap[item.user_id] || false,
          }));
          setDbListings(formattedListings);
          showSuccess("Annonser laddades", `${formattedListings.length} annonser hittades`);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Kunde inte ladda annonser");
        showError("Kunde inte ladda annonser", "Försök igen om en stund");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  };

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const allListings = dbListings;

  const filteredListings = useMemo(() => {
    let filtered = allListings.filter((listing) => {
      const matchesCategory = !selectedCategory || listing.category === selectedCategory;
      const matchesCondition = !selectedCondition || listing.condition === selectedCondition;
      const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
      const matchesSearch =
        !searchTerm ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesCondition && matchesPrice && matchesSearch;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [allListings, selectedCategory, selectedCondition, searchTerm, priceRange, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6 lg:mb-10">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 lg:mb-3">
              Alla annonser
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Hitta din nästa vintage-pärla bland {allListings.length} annonser
            </p>
          </div>

          {/* Search and Filters */}
          <div className={`mb-6 lg:mb-8 space-y-3 lg:space-y-4 ${getResponsiveClass('px-0', 'px-0', 'px-0')}`}>
            <div className={`flex flex-col ${getResponsiveClass('gap-3', 'gap-3', 'gap-3')}`}>
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${getResponsiveClass('w-5 h-5', 'w-5 h-5', 'w-5 h-5')} text-muted-foreground`} />
                <MobileOptimizedInput
                  placeholder="Sök märke, modell eller beskrivning..."
                  mobilePlaceholder="Sök..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
              
              <div className={`flex ${getResponsiveClass('flex-col gap-2', 'flex-row gap-2', 'flex-row gap-2')}`}>
                <MobileOptimizedButton
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  mobileSize="default"
                  className={getResponsiveClass('w-full', 'w-auto', 'w-auto')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {isMobile ? 'Filter' : 'Filter'}
                </MobileOptimizedButton>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className={getResponsiveClass('h-10', 'h-10', 'h-10')}>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {isMobile ? 'Sortera' : 'Sortera'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nyast först</SelectItem>
                    <SelectItem value="oldest">Äldst först</SelectItem>
                    <SelectItem value="price_low">Lägsta pris</SelectItem>
                    <SelectItem value="price_high">Högsta pris</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className={`flex gap-1 ${getResponsiveClass('justify-center', '', '')}`}>
                  <CompactButton
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    mobileSize="sm"
                    square
                  >
                    <Grid className="w-4 h-4" />
                  </CompactButton>
                  <CompactButton
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    mobileSize="sm"
                    square
                  >
                    <List className="w-4 h-4" />
                  </CompactButton>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className={`overflow-x-auto pb-2 ${getResponsiveClass('-mx-4 px-4', '-mx-4 px-4', '-mx-4 px-4')}`}>
              <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-4 sm:p-6 rounded-xl bg-card border border-border space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Avancerade filter</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Price Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prisintervall</span>
                    <span className="font-medium text-foreground">
                      {priceRange[0].toLocaleString("sv-SE")} - {priceRange[1].toLocaleString("sv-SE")} kr
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={100000}
                    step={1000}
                    className="w-full"
                  />
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Skick</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !selectedCondition
                          ? "bg-muted text-muted-foreground hover:bg-muted/80"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      onClick={() => setSelectedCondition(null)}
                    >
                      Alla
                    </button>
                    {conditions.map((condition) => (
                      <button
                        key={condition.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCondition === condition.id
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => setSelectedCondition(condition.id)}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 lg:mb-6">
            <p className="text-sm lg:text-base text-muted-foreground">
              {loading ? "Laddar..." : `${filteredListings.length} annonser hittades`}
            </p>
          </div>

          {/* Listings Grid */}
          {error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Något gick fel
              </h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <MobileOptimizedButton onClick={handleRetry} mobileSize="default">
                Försök igen
              </MobileOptimizedButton>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {/* Loading skeleton for results count */}
              <SkeletonText className="w-32 h-5" />
              
              {/* Loading skeleton for listings */}
              <ResponsiveGrid
                mobileCols={1}
                tabletCols={2}
                desktopCols={4}
                gap={getResponsiveValue('gap-3', 'gap-4', 'gap-6')}
              >
                {Array.from({ length: getResponsiveValue(4, 6, 8) }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </ResponsiveGrid>
            </div>
          ) : filteredListings.length > 0 ? (
            <ResponsiveGrid
              mobileCols={viewMode === "grid" ? 1 : 1}
              tabletCols={viewMode === "grid" ? 2 : 1}
              desktopCols={viewMode === "grid" ? 4 : 1}
              gap={getResponsiveValue('gap-3', 'gap-4', 'gap-6')}
              className={viewMode === "list" ? "max-w-4xl mx-auto" : ""}
            >
              {filteredListings.map((listing) => (
                <div key={listing.id} className={viewMode === "grid" ? "" : "bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"}>
                  <ListingCard key={listing.id} listing={listing} isStoreAccount={listing.isStore} />
                </div>
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Inga annonser hittades
              </h3>
              <p className="text-muted-foreground mb-6">
                Prova att ändra dina sökfilter eller utforska andra kategorier
              </p>
              <MobileOptimizedButton 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCondition(null);
                  setPriceRange([0, 100000]);
                  setSearchParams({});
                }}
                mobileSize="default"
              >
                Rensa filter
              </MobileOptimizedButton>
            </div>
          )}

          {/* Ad Banner */}
          <div className="mt-12">
            <AdBanner slot="8997727388" format="horizontal" className="max-w-4xl mx-auto" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
