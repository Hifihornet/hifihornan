import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ShoppingCart, Music, Star, Heart, ExternalLink, Phone, Mail, MapPin, Clock, Package, TrendingUp, Home, Store, Users, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "sonner";

interface VinylRecord {
  id: string;
  discogs_id: number;
  company_id: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
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

interface CartItem extends VinylRecord {
  quantity: number;
}

const VinylHyllan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isCreator, isAdmin, isModerator } = useUserRoles(user?.id);
  
  // Check if user has business access
  const hasBusinessAccess = isCreator || isAdmin || isModerator;
  
  const [vinyls, setVinyls] = useState<VinylRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("artist");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVinyl, setSelectedVinyl] = useState<VinylRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadVinyls();
    loadCart();
  }, []);

  const loadVinyls = async () => {
    try {
      setLoading(true);
      // TODO: Load vinyls from database (only in_stock items)
      // const { data } = await supabase.from("vinyl_catalog").select("*").eq("in_stock", true);
      
      // Mock data with company info
      const mockVinyls: VinylRecord[] = [
        {
          id: "1",
          discogs_id: 12345,
          company_id: "company1",
          company_name: "VinylButiken AB",
          company_email: "info@vinylbutiken.se",
          company_phone: "08-123 456 78",
          company_address: "Drottninggatan 45, Stockholm",
          artist: "The Beatles",
          title: "Abbey Road",
          year: 1969,
          label: "Apple",
          catalog_number: "SO 383",
          condition: "Mint",
          price: 299,
          in_stock: true,
          image_url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Beatles_-_Abbey_Road.jpg",
          genre: ["Rock"],
          style: ["Psychedelic Rock", "Pop Rock"],
          format: "LP",
          quantity: 3,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        {
          id: "2",
          discogs_id: 67890,
          company_id: "company2",
          company_name: "Skivfabriken",
          company_email: "hej@skivfabriken.se",
          company_phone: "031-987 654 32",
          company_address: "Kungsportsplatsen 2, Göteborg",
          artist: "Pink Floyd",
          title: "The Dark Side of the Moon",
          year: 1973,
          label: "Harvest",
          catalog_number: "SHVL 804",
          condition: "Near Mint",
          price: 349,
          in_stock: true,
          image_url: "https://picsum.photos/seed/darkside/400/400.jpg",
          genre: ["Rock"],
          style: ["Progressive Rock", "Psychedelic Rock"],
          format: "LP",
          quantity: 2,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        {
          id: "3",
          discogs_id: 11111,
          company_id: "company1",
          company_name: "VinylButiken AB",
          company_email: "info@vinylbutiken.se",
          company_phone: "08-123 456 78",
          company_address: "Drottninggatan 45, Stockholm",
          artist: "Miles Davis",
          title: "Kind of Blue",
          year: 1959,
          label: "Columbia",
          catalog_number: "CL 1355",
          condition: "Very Good Plus",
          price: 499,
          in_stock: true,
          image_url: "https://picsum.photos/seed/kindofblue/400/400.jpg",
          genre: ["Jazz"],
          style: ["Modal Jazz", "Cool Jazz"],
          format: "LP",
          quantity: 1,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        {
          id: "4",
          discogs_id: 22222,
          company_id: "company3",
          company_name: "Jazz & Soul Records",
          company_email: "orders@jazzsouls.se",
          company_phone: "040-555 123 45",
          company_address: "Stortorget 1, Malmö",
          artist: "John Coltrane",
          title: "A Love Supreme",
          year: 1965,
          label: "Impulse!",
          catalog_number: "A-77",
          condition: "Mint",
          price: 599,
          in_stock: true,
          image_url: "https://picsum.photos/seed/lovesupreme/400/400.jpg",
          genre: ["Jazz"],
          style: ["Hard Bop", "Modal Jazz"],
          format: "LP",
          quantity: 2,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        }
      ];
      
      setVinyls(mockVinyls);
    } catch (error) {
      console.error("Error loading vinyls:", error);
      toast.error("Kunde inte ladda vinyl-katalogen");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("vinyl-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("vinyl-cart", JSON.stringify(newCart));
  };

  const addToCart = (vinyl: VinylRecord, quantity: number = 1) => {
    const existingItem = cart.find(item => item.id === vinyl.id);
    let newCart: CartItem[];
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === vinyl.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...vinyl, quantity }];
    }
    
    saveCart(newCart);
    toast.success(`${vinyl.artist} - ${vinyl.title} tillagd i varukorg`);
  };

  const removeFromCart = (vinylId: string) => {
    const newCart = cart.filter(item => item.id !== vinylId);
    saveCart(newCart);
    toast.success("Borttagen från varukorg");
  };

  const updateCartQuantity = (vinylId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(vinylId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === vinylId
        ? { ...item, quantity }
        : item
    );
    saveCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredVinyls = vinyls.filter(vinyl => {
    const matchesSearch = vinyl.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vinyl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vinyl.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || vinyl.genre?.includes(selectedGenre);
    const matchesCondition = selectedCondition === "all" || vinyl.condition === selectedCondition;
    const matchesPrice = selectedPriceRange === "all" || 
                         (selectedPriceRange === "0-200" && (vinyl.price || 0) <= 200) ||
                         (selectedPriceRange === "200-400" && (vinyl.price || 0) > 200 && (vinyl.price || 0) <= 400) ||
                         (selectedPriceRange === "400+" && (vinyl.price || 0) > 400);
    
    return matchesSearch && matchesGenre && matchesCondition && matchesPrice && vinyl.in_stock;
  }).sort((a, b) => {
    switch (sortBy) {
      case "artist":
        return a.artist.localeCompare(b.artist);
      case "title":
        return a.title.localeCompare(b.title);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "year":
        return (b.year || 0) - (a.year || 0);
      default:
        return 0;
    }
  });

  const genres = Array.from(new Set(vinyls.flatMap(v => v.genre || [])));
  const conditions = Array.from(new Set(vinyls.map(v => v.condition).filter(Boolean)));
  const companies = Array.from(new Set(vinyls.map(v => v.company_name)));

  const handleCheckout = () => {
    if (!user) {
      toast.error("Du måste vara inloggad för att slutföra köpet");
      navigate("/auth");
      return;
    }
    
    navigate("/checkout");
  };

  const handleContactSeller = (vinyl: VinylRecord) => {
    // TODO: Implement contact seller functionality
    toast.info(`Kontaktar ${vinyl.company_name}...`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Public Navigation Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Music className="w-4 h-4" />
              <span>VinylHyllan - Upptäck vinyl från svenska butiker</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <Home className="w-4 h-4" />
                Startsida
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/browse")}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <Store className="w-4 h-4" />
                Annonser
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/forum")}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <Users className="w-4 h-4" />
                Forum
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/vinylhyllan")}
                className="flex items-center gap-2 bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
              >
                <Music className="w-4 h-4" />
                VinylHyllan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="w-8 h-8 text-blue-600" />
            VinylHyllan
          </h1>
          <p className="text-muted-foreground mt-2">
            Upptäck och köpa vinyl från svenska skivbutiker
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="outline"
            className="flex items-center gap-2 relative"
          >
            <ShoppingCart className="w-4 h-4" />
            Varukorg
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{vinyls.length}</p>
              <p className="text-xs text-muted-foreground">Vinyls</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{vinyls.filter(v => v.in_stock).length}</p>
              <p className="text-xs text-muted-foreground">I lager</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Music className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{genres.length}</p>
              <p className="text-xs text-muted-foreground">Genrer</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{companies.length}</p>
              <p className="text-xs text-muted-foreground">Butiker</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Sök artist, titel, butik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
            
            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Pris" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla priser</SelectItem>
                <SelectItem value="0-200">0-200 kr</SelectItem>
                <SelectItem value="200-400">200-400 kr</SelectItem>
                <SelectItem value="400+">400+ kr</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sortera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artist">Artist</SelectItem>
                <SelectItem value="title">Titel</SelectItem>
                <SelectItem value="price-low">Pris (lägst)</SelectItem>
                <SelectItem value="price-high">Pris (högst)</SelectItem>
                <SelectItem value="year">År</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vinyl Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Laddar vinyl-katalog...</p>
        </div>
      ) : filteredVinyls.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga vinylskivor hittades</h3>
          <p className="text-muted-foreground">Prova att justera dina filter eller söktermer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVinyls.map((vinyl) => (
            <Card key={vinyl.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-square bg-gray-100 relative">
                {vinyl.image_url ? (
                  <img
                    src={vinyl.image_url}
                    alt={`${vinyl.artist} - ${vinyl.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <Badge className="absolute top-2 right-2 bg-green-500">
                  I lager
                </Badge>
                
                <Badge className="absolute top-2 left-2 bg-blue-500">
                  {vinyl.company_name}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 truncate">{vinyl.artist}</h3>
                  <p className="text-muted-foreground mb-2 truncate">{vinyl.title}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vinyl.genre?.slice(0, 2).map(g => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>{vinyl.year}</span>
                    <span>{vinyl.condition}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {vinyl.quantity} st i lager
                  </p>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">{vinyl.price} kr</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedVinyl(vinyl);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(vinyl)}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Köp
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSeller(vinyl)}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Varukorg ({getTotalItems()} varor)
            </DialogTitle>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Din varukorg är tom</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={`${item.artist} - ${item.title}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.artist} - {item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.company_name}</p>
                    <p className="font-medium">{item.price} kr</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Totalt:</span>
                  <span className="font-bold text-lg">{getTotalPrice()} kr</span>
                </div>
                
                <Button onClick={handleCheckout} className="w-full">
                  Gå till kassan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              {selectedVinyl?.artist} - {selectedVinyl?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVinyl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                  {selectedVinyl.image_url ? (
                    <img
                      src={selectedVinyl.image_url}
                      alt={`${selectedVinyl.artist} - ${selectedVinyl.title}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Pris:</span>
                    <span className="font-bold text-lg">{selectedVinyl.price} kr</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className="bg-green-500">I lager ({selectedVinyl.quantity} st)</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Skick:</span>
                    <span>{selectedVinyl.condition}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">År:</span>
                    <span>{selectedVinyl.year}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Format:</span>
                    <span>{selectedVinyl.format}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Säljare</h4>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold mb-2">{selectedVinyl.company_name}</h5>
                      
                      {selectedVinyl.company_address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-4 h-4" />
                          {selectedVinyl.company_address}
                        </div>
                      )}
                      
                      {selectedVinyl.company_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Phone className="w-4 h-4" />
                          {selectedVinyl.company_phone}
                        </div>
                      )}
                      
                      {selectedVinyl.company_email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Mail className="w-4 h-4" />
                          {selectedVinyl.company_email}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContactSeller(selectedVinyl)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Kontakta säljare
                        </Button>
                        
                        <Button
                          onClick={() => addToCart(selectedVinyl)}
                          className="flex-1"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Lägg i varukorg
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedVinyl.genre && selectedVinyl.genre.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Genre</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedVinyl.genre.map(g => (
                        <Badge key={g} variant="secondary">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedVinyl.style && selectedVinyl.style.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Stil</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedVinyl.style.map(s => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedVinyl.tracklist && selectedVinyl.tracklist.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Spårlista</h4>
                    <div className="space-y-1">
                      {selectedVinyl.tracklist.map((track, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="font-medium">{track.position}</span>
                          <span className="flex-1 mx-2">{track.title}</span>
                          <span className="text-muted-foreground">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://www.discogs.com/release/${selectedVinyl.discogs_id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visa på Discogs
                  </Button>
                  
                  <Button
                    onClick={() => {
                      addToCart(selectedVinyl);
                      setIsDetailDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Lägg i varukorg
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Behöver du hjälp? Kontakta support@hifihornet.se</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till startsidan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VinylHyllan;
