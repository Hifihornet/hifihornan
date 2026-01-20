import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Settings, Package, TrendingUp, Upload, Home, Store, Users, BarChart3, ArrowLeft, Lock, AlertCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "sonner";
import VinylCatalog from "@/components/VinylCatalog";
import VinylImportDialog from "@/components/VinylImportDialog";

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

const VinylShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isCreator, isAdmin, isModerator } = useUserRoles(user?.id);
  const [vinyls, setVinyls] = useState<VinylRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Check if user has business access
  const hasBusinessAccess = isCreator || isAdmin || isModerator;

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Check if user has business access
    if (!hasBusinessAccess) {
      // Show access denied message instead of redirecting
      return;
    }
    
    loadVinyls();
  }, [user, hasBusinessAccess, navigate]);

  const loadVinyls = async () => {
    try {
      setLoading(true);
      // TODO: Load vinyls from database
      // const { data } = await supabase.from("vinyl_catalog").select("*").eq("company_id", user?.id);
      
      // Mock data for now
      const mockVinyls: VinylRecord[] = [
        {
          id: "1",
          discogs_id: 12345,
          company_id: user?.id || "",
          artist: "The Beatles",
          title: "Abbey Road",
          year: 1969,
          label: "Apple Records",
          catalog_number: "SO 383",
          condition: "Mint",
          price: 299,
          in_stock: true,
          image_url: "https://i.discogs.com/...",
          genre: ["Rock"],
          style: ["Psychedelic Rock", "Pop Rock"],
          format: "LP",
          quantity: 1,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        {
          id: "2",
          discogs_id: 67890,
          company_id: user?.id || "",
          artist: "Pink Floyd",
          title: "The Dark Side of the Moon",
          year: 1973,
          label: "Harvest",
          catalog_number: "SHVL 804",
          condition: "Near Mint",
          price: 349,
          in_stock: true,
          image_url: "https://i.discogs.com/...",
          genre: ["Rock"],
          style: ["Progressive Rock", "Psychedelic Rock"],
          format: "LP",
          quantity: 1,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        {
          id: "3",
          discogs_id: 11111,
          company_id: user?.id || "",
          artist: "Miles Davis",
          title: "Kind of Blue",
          year: 1959,
          label: "Columbia",
          catalog_number: "CL 1355",
          condition: "Very Good Plus",
          price: 499,
          in_stock: false,
          image_url: "https://i.discogs.com/...",
          genre: ["Jazz"],
          style: ["Modal Jazz", "Cool Jazz"],
          format: "LP",
          quantity: 0,
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

  const handleImportComplete = (importedCount: number) => {
    toast.success(`${importedCount} vinylskivor importerade!`);
    loadVinyls(); // Reload the catalog
  };

  const handleUpdateVinyl = (updatedVinyl: VinylRecord) => {
    setVinyls(prev => prev.map(v => v.id === updatedVinyl.id ? updatedVinyl : v));
    // TODO: Update in database
    toast.success("Vinyl uppdaterad!");
  };

  const handleDeleteVinyl = (vinylId: string) => {
    setVinyls(prev => prev.filter(v => v.id !== vinylId));
    // TODO: Delete from database
    toast.success("Vinyl borttagen!");
  };

  // Show access denied if user doesn't have business access
  if (!hasBusinessAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Företagskonto krävs</h2>
              <p className="text-muted-foreground mb-6">
                VinylShop är endast tillgängligt för företag med Creator, Store eller Admin-roll.
                Detta skyddar känslig försäljningsdata och företagsinformation.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Varför krävs företagskonto?</h3>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1 text-left">
                    <li>• Skydda försäljningsdata och statistik</li>
                    <li>• Hantera känslig företagsinformation</li>
                    <li>• Importera från Discogs med API-nycklar</li>
                    <li>• Se företagsspecifika rapporter och analytics</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Hur får jag företagskonto?</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Kontakta administratör för att uppgradera ditt konto:
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>support@hifihornet.se</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>08-123 456 78</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center mt-8">
                <Button onClick={() => navigate("/vinylhyllan")} variant="outline">
                  <Music className="w-4 h-4 mr-2" />
                  Se VinylHyllan (publik)
                </Button>
                
                <Button onClick={() => navigate("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Till startsidan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = {
    total: vinyls.length,
    inStock: vinyls.filter(v => v.in_stock).length,
    outOfStock: vinyls.filter(v => !v.in_stock).length,
    genres: new Set(vinyls.flatMap(v => v.genre || [])).size,
    totalValue: vinyls.reduce((sum, v) => sum + (v.price || 0) * (v.quantity || 1), 0),
    avgPrice: vinyls.length > 0 ? vinyls.reduce((sum, v) => sum + (v.price || 0), 0) / vinyls.length : 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Navigation Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="w-4 h-4" />
              <span>Företagsportal</span>
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
                className="flex items-center gap-2 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              >
                <Music className="w-4 h-4" />
                VinylShop
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
            VinylShop
          </h1>
          <p className="text-muted-foreground mt-2">
            Hantera ditt vinylsortiment med Discogs integration
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importera från Discogs
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Inställningar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Totalt antal</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              <p className="text-xs text-muted-foreground">I lager</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Slutsåld</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Music className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{stats.genres}</p>
              <p className="text-xs text-muted-foreground">Genrer</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} kr</p>
              <p className="text-xs text-muted-foreground">Totalt värde</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-2xl font-bold">{Math.round(stats.avgPrice)} kr</p>
              <p className="text-xs text-muted-foreground">Snittpris</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vinyl Catalog */}
      <VinylCatalog
        vinyls={vinyls}
        loading={loading}
        onUpdate={handleUpdateVinyl}
        onDelete={handleDeleteVinyl}
        onImport={() => setIsImportDialogOpen(true)}
        isImporting={isImporting}
        showActions={true}
        compact={false}
      />

      {/* Import Dialog */}
      <VinylImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        companyId={user?.id || ""}
        onImportComplete={handleImportComplete}
      />

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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/vinylhyllan")}
                className="flex items-center gap-2 text-blue-600"
              >
                <Music className="w-4 h-4" />
                Se VinylHyllan (publik)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VinylShop;
