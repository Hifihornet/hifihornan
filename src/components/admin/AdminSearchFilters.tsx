import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ListingFilters {
  search: string;
  status: string;
  category: string;
}

interface UserFilters {
  search: string;
  role: string;
  hasListings: string;
}

interface AdminSearchFiltersProps {
  type: "listings" | "users";
  onFilterChange: (filters: ListingFilters | UserFilters) => void;
}

const CATEGORIES = [
  "Alla kategorier",
  "Förstärkare",
  "Högtalare", 
  "Skivspelare",
  "CD-spelare",
  "Kassettdäck",
  "Tuner",
  "Receiver",
  "Övrigt"
];

const STATUSES = [
  { value: "", label: "Alla status" },
  { value: "active", label: "Aktiva" },
  { value: "sold", label: "Sålda" },
  { value: "hidden", label: "Dolda" },
  { value: "reserved", label: "Reserverade" }
];

const ROLES = [
  { value: "", label: "Alla roller" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "creator", label: "Creator" },
  { value: "store", label: "Företag" }
];

const AdminSearchFilters = ({ type, onFilterChange }: AdminSearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listingFilters, setListingFilters] = useState<ListingFilters>({
    search: "",
    status: "",
    category: ""
  });
  const [userFilters, setUserFilters] = useState<UserFilters>({
    search: "",
    role: "",
    hasListings: ""
  });

  const handleListingFilterChange = (key: keyof ListingFilters, value: string) => {
    const newFilters = { ...listingFilters, [key]: value };
    setListingFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleUserFilterChange = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...userFilters, [key]: value };
    setUserFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    if (type === "listings") {
      const emptyFilters = { search: "", status: "", category: "" };
      setListingFilters(emptyFilters);
      onFilterChange(emptyFilters);
    } else {
      const emptyFilters = { search: "", role: "", hasListings: "" };
      setUserFilters(emptyFilters);
      onFilterChange(emptyFilters);
    }
  };

  const hasActiveFilters = type === "listings"
    ? listingFilters.search || listingFilters.status || listingFilters.category
    : userFilters.search || userFilters.role || userFilters.hasListings;

  return (
    <div className="p-4 border-b border-border space-y-3">
      {/* Search input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={type === "listings" ? "Sök efter titel, säljare..." : "Sök efter namn, e-post..."}
            value={type === "listings" ? listingFilters.search : userFilters.search}
            onChange={(e) => 
              type === "listings" 
                ? handleListingFilterChange("search", e.target.value)
                : handleUserFilterChange("search", e.target.value)
            }
            className="pl-9"
          />
        </div>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"} 
              size="icon"
              className="shrink-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearFilters}
            title="Rensa filter"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-3 pt-2">
            {type === "listings" ? (
              <>
                <Select
                  value={listingFilters.status}
                  onValueChange={(value) => handleListingFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value || "all"} value={status.value || "all"}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={listingFilters.category}
                  onValueChange={(value) => handleListingFilterChange("category", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat === "Alla kategorier" ? "" : cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select
                  value={userFilters.role}
                  onValueChange={(value) => handleUserFilterChange("role", value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Roll" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value || "all"} value={role.value || "all"}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={userFilters.hasListings}
                  onValueChange={(value) => handleUserFilterChange("hasListings", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Annonser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla användare</SelectItem>
                    <SelectItem value="with">Med annonser</SelectItem>
                    <SelectItem value="without">Utan annonser</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AdminSearchFilters;
