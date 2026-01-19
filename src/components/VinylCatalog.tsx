import { useState, useMemo } from "react";
import { Search, Filter, Grid, List, SortAsc, SortDesc, Download, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import VinylCard from "./VinylCard";
import { toast } from "sonner";

interface VinylRecord {
  id: string;
  discogs_id: number;
  company_id: string;
  artist: string;
  title: string;
  year?: number;
  label?: string;
  catalog_number?: string;
  condition?: string;
  price?: number;
  in_stock: boolean;
  image_url?: string;
  genre?: string[];
  style?: string[];
  format?: string;
  quantity?: number;
  tracklist?: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
  notes?: string;
  created_at: string;
  updated_at: string;
  discogs_rating?: number;
  discogs_date_added?: string;
}

interface VinylCatalogProps {
  vinyls: VinylRecord[];
  loading?: boolean;
  onUpdate?: (updatedVinyl: VinylRecord) => void;
  onDelete?: (vinylId: string) => void;
  onImport?: () => void;
  isImporting?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const VinylCatalog = ({
  vinyls,
  loading = false,
  onUpdate,
  onDelete,
  onImport,
  isImporting = false,
  showActions = true,
  compact = false
}: VinylCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("artist");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVinyls, setSelectedVinyls] = useState<string[]>([]);

  // Extract unique values for filters
  const genres = useMemo(() => {
    const allGenres = vinyls.flatMap(v => v.genre || []);
    return Array.from(new Set(allGenres)).sort();
  }, [vinyls]);

  const styles = useMemo(() => {
    const allStyles = vinyls.flatMap(v => v.style || []);
    return Array.from(new Set(allStyles)).sort();
  }, [vinyls]);

  const conditions = useMemo(() => {
    const allConditions = vinyls.map(v => v.condition).filter(Boolean);
    return Array.from(new Set(allConditions)).sort();
  }, [vinyls]);

  const formats = useMemo(() => {
    const allFormats = vinyls.map(v => v.format).filter(Boolean);
    return Array.from(new Set(allFormats)).sort();
  }, [vinyls]);

  // Filter and sort vinyls
  const filteredAndSortedVinyls = useMemo(() => {
    let filtered = vinyls.filter(vinyl => {
      const matchesSearch = vinyl.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vinyl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vinyl.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vinyl.catalog_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === "all" || vinyl.genre?.includes(selectedGenre);
      const matchesStyle = selectedStyle === "all" || vinyl.style?.includes(selectedStyle);
      const matchesCondition = selectedCondition === "all" || vinyl.condition === selectedCondition;
      const matchesFormat = selectedFormat === "all" || vinyl.format === selectedFormat;
      const matchesStock = stockStatus === "all" || 
                           (stockStatus === "in_stock" && vinyl.in_stock) ||
                           (stockStatus === "out_of_stock" && !vinyl.in_stock);
      
      return matchesSearch && matchesGenre && matchesStyle && matchesCondition && matchesFormat && matchesStock;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "artist":
          aValue = a.artist.toLowerCase();
          bValue = b.artist.toLowerCase();
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "year":
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "label":
          aValue = a.label?.toLowerCase() || "";
          bValue = b.label?.toLowerCase() || "";
          break;
        case "condition":
          aValue = a.condition || "";
          bValue = b.condition || "";
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.artist.toLowerCase();
          bValue = b.artist.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vinyls, searchTerm, selectedGenre, selectedStyle, selectedCondition, selectedFormat, stockStatus, sortBy, sortOrder]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVinyls(filteredAndSortedVinyls.map(v => v.id));
    } else {
      setSelectedVinyls([]);
    }
  };

  const handleSelectVinyl = (vinylId: string, checked: boolean) => {
    if (checked) {
      setSelectedVinyls(prev => [...prev, vinylId]);
    } else {
      setSelectedVinyls(prev => prev.filter(id => id !== vinylId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVinyls.length === 0) return;
    
    if (!confirm(`Är du säker på att du vill ta bort ${selectedVinyls.length} vinylskivor?`)) {
      return;
    }

    try {
      // TODO: Bulk delete from database
      // await supabase.from("vinyl_catalog").delete().in("id", selectedVinyls);
      
      selectedVinyls.forEach(id => onDelete?.(id));
      setSelectedVinyls([]);
      toast.success(`${selectedVinyls.length} vinylskivor borttagna!`);
    } catch (error) {
      console.error("Error bulk deleting vinyls:", error);
      toast.error("Kunde inte ta bort vinylskivor");
    }
  };

  const handleBulkUpdate = (updates: Partial<VinylRecord>) => {
    // TODO: Bulk update in database
    selectedVinyls.forEach(id => {
      const vinyl = vinyls.find(v => v.id === id);
      if (vinyl) {
        onUpdate?.({ ...vinyl, ...updates });
      }
    });
    setSelectedVinyls([]);
    toast.success(`${selectedVinyls.length} vinylskivor uppdaterade!`);
  };

  const exportToCSV = () => {
    const headers = [
      "Artist", "Titel", "År", "Skivbolag", "Katalognr", "Format", "Skick", 
      "Pris", "Antal", "Status", "Genrer", "Stilar", "Discogs ID"
    ];
    
    const csvData = filteredAndSortedVinyls.map(vinyl => [
      vinyl.artist,
      vinyl.title,
      vinyl.year || "",
      vinyl.label || "",
      vinyl.catalog_number || "",
      vinyl.format || "",
      vinyl.condition || "",
      vinyl.price || "",
      vinyl.quantity || 1,
      vinyl.in_stock ? "I lager" : "Slutsåld",
      vinyl.genre?.join("; ") || "",
      vinyl.style?.join("; ") || "",
      vinyl.discogs_id
    ]);
    
    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vinyl-katalog-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Katalog exporterad till CSV!");
  };

  const stats = useMemo(() => {
    const total = vinyls.length;
    const inStock = vinyls.filter(v => v.in_stock).length;
    const outOfStock = vinyls.filter(v => !v.in_stock).length;
    const totalValue = vinyls.reduce((sum, v) => sum + (v.price || 0) * (v.quantity || 1), 0);
    const avgPrice = total > 0 ? totalValue / vinyls.reduce((sum, v) => sum + (v.quantity || 1), 0) : 0;
    
    return { total, inStock, outOfStock, totalValue, avgPrice };
  }, [vinyls]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Laddar vinyl-katalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Totalt antal</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              <p className="text-sm text-muted-foreground">I lager</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">Slutsåld</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} kr</p>
              <p className="text-sm text-muted-foreground">Totalt värde</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(stats.avgPrice)} kr</p>
              <p className="text-sm text-muted-foreground">Snittpris</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Primary Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Sök artist, titel, skivbolag, katalognr..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {onImport && (
                  <Button onClick={onImport} disabled={isImporting}>
                    {isImporting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Importera
                  </Button>
                )}
                
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportera
                </Button>
                
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla genrer</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Stil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla stilar</SelectItem>
                  {styles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Skick" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla skick</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla format</SelectItem>
                  {formats.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockStatus} onValueChange={setStockStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="in_stock">I lager</SelectItem>
                  <SelectItem value="out_of_stock">Slutsåld</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sortera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="title">Titel</SelectItem>
                    <SelectItem value="year">År</SelectItem>
                    <SelectItem value="price">Pris</SelectItem>
                    <SelectItem value="label">Skivbolag</SelectItem>
                    <SelectItem value="condition">Skick</SelectItem>
                    <SelectItem value="created_at">Datum</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedVinyls.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedVinyls.length === filteredAndSortedVinyls.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">
                    {selectedVinyls.length} valda
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Select onValueChange={(value) => handleBulkUpdate({ in_stock: value === "in_stock" })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">Sätt i lager</SelectItem>
                      <SelectItem value="out_of_stock">Markera slutsåld</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    Ta bort
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAndSortedVinyls.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Inga vinylskivor hittades</p>
              <p className="text-sm">
                {vinyls.length === 0 
                  ? "Börja med att importera ditt sortiment från Discogs"
                  : "Prova att justera dina filter eller söktermer"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Visar {filteredAndSortedVinyls.length} av {vinyls.length} vinylskivor
            </p>
            
            {showActions && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVinyls.length === filteredAndSortedVinyls.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">Välj alla</span>
              </div>
            )}
          </div>
          
          {/* Vinyl Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedVinyls.map((vinyl) => (
                <div key={vinyl.id} className="relative">
                  {showActions && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedVinyls.includes(vinyl.id)}
                        onCheckedChange={(checked) => handleSelectVinyl(vinyl.id, checked as boolean)}
                      />
                    </div>
                  )}
                  <VinylCard
                    vinyl={vinyl}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    showActions={showActions}
                    compact={compact}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedVinyls.map((vinyl) => (
                <div key={vinyl.id} className="relative">
                  {showActions && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                      <Checkbox
                        checked={selectedVinyls.includes(vinyl.id)}
                        onCheckedChange={(checked) => handleSelectVinyl(vinyl.id, checked as boolean)}
                      />
                    </div>
                  )}
                  <div className={showActions ? "ml-8" : ""}>
                    <VinylCard
                      vinyl={vinyl}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      showActions={showActions}
                      compact={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VinylCatalog;
