import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CategoryFilter from "@/components/CategoryFilter";
import { mockListings, conditions } from "@/data/listings";

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get("category");

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const filteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
      const matchesCategory = !selectedCategory || listing.category === selectedCategory;
      const matchesCondition = !selectedCondition || listing.condition === selectedCondition;
      const matchesSearch =
        !searchTerm ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesCondition && matchesSearch;
    });
  }, [selectedCategory, selectedCondition, searchTerm]);

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
              Hitta din nästa vintage-pärla bland {mockListings.length} annonser
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
              {filteredListings.length} annonser hittades
            </p>
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
