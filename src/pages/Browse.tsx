import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CategoryFilter from "@/components/CategoryFilter";
import AdBanner from "@/components/AdBanner";
import { conditions, Listing } from "@/data/listings";
import { supabase } from "@/integrations/supabase/client";

interface ListingWithStore extends Listing {
  userId?: string;
  isStore?: boolean;
}

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dbListings, setDbListings] = useState<ListingWithStore[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("category");

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
        console.error("Error:", error);
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

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const allListings = dbListings;

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      const matchesCategory = !selectedCategory || listing.category === selectedCategory;
      const matchesCondition = !selectedCondition || listing.condition === selectedCondition;
      const matchesSearch =
        !searchTerm ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesCondition && matchesSearch;
    });
  }, [allListings, selectedCategory, selectedCondition, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Alla annonser
            </h1>
            <p className="text-muted-foreground">
              Hitta din nästa vintage-pärla bland {allListings.length} annonser
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Sök märke, modell eller beskrivning..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:w-auto"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Category Filter */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
            </div>

            {/* Condition Filter */}
            {showFilters && (
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-medium text-foreground mb-3">Skick</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCondition(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCondition === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    Alla
                  </button>
                  {conditions.map((condition) => (
                    <button
                      key={condition.id}
                      onClick={() => setSelectedCondition(condition.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCondition === condition.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                    >
                      {condition.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? "Laddar..." : `${filteredListings.length} annonser hittades`}
            </p>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} isStoreAccount={listing.isStore} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Inga annonser hittades
              </h3>
              <p className="text-muted-foreground mb-6">
                Prova att ändra dina sökfilter eller utforska andra kategorier
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedCondition(null);
                setSearchParams({});
              }}>
                Rensa filter
              </Button>
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
