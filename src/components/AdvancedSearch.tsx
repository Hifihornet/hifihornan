import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories, conditions } from "@/data/listings";

interface SearchFilters {
  query: string;
  category: string | null;
  condition: string | null;
  minPrice: number;
  maxPrice: number;
  location: string;
  sortBy: string;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const AdvancedSearch = ({ filters, onFiltersChange, onSearch }: AdvancedSearchProps) => {
  const [open, setOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      category: null,
      condition: null,
      minPrice: 0,
      maxPrice: 100000,
      location: "",
      sortBy: "newest",
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.condition,
    filters.minPrice > 0,
    filters.maxPrice < 100000,
    filters.location,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Sök märke, modell eller beskrivning..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-12 h-12"
          />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Avancerad sökning</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={filters.category || ""}
                  onValueChange={(v) => updateFilter("category", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alla kategorier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alla kategorier</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Skick</Label>
                <Select
                  value={filters.condition || ""}
                  onValueChange={(v) => updateFilter("condition", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alla skick" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alla skick</SelectItem>
                    {conditions.map((cond) => (
                      <SelectItem key={cond.id} value={cond.id}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <Label>Prisintervall</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ""}
                    onChange={(e) => updateFilter("minPrice", Number(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice === 100000 ? "" : filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", Number(e.target.value) || 100000)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">kr</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Plats</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Stad eller område..."
                    value={filters.location}
                    onChange={(e) => updateFilter("location", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label>Sortera efter</Label>
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nyast först</SelectItem>
                    <SelectItem value="oldest">Äldst först</SelectItem>
                    <SelectItem value="price_low">Lägst pris</SelectItem>
                    <SelectItem value="price_high">Högst pris</SelectItem>
                    <SelectItem value="popular">Mest visade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Rensa
                </Button>
                <Button
                  onClick={() => {
                    onSearch();
                    setOpen(false);
                  }}
                  className="flex-1"
                >
                  Sök
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button onClick={onSearch} className="h-12">
          <Search className="w-4 h-4 mr-2" />
          Sök
        </Button>
      </div>
    </div>
  );
};

export default AdvancedSearch;
