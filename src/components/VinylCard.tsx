import { useState } from "react";
import { Music, Edit, Trash2, ExternalLink, Heart, ShoppingCart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

interface VinylCardProps {
  vinyl: VinylRecord;
  onUpdate?: (updatedVinyl: VinylRecord) => void;
  onDelete?: (vinylId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const VinylCard = ({ 
  vinyl, 
  onUpdate, 
  onDelete, 
  showActions = true, 
  compact = false 
}: VinylCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<VinylRecord>(vinyl);
  const [isSaving, setIsSaving] = useState(false);

  const conditions = [
    "Mint (M)",
    "Near Mint (NM or M-)",
    "Very Good Plus (VG+)",
    "Very Good (VG)",
    "Good Plus (G+)",
    "Good (G)",
    "Fair (F)",
    "Poor (P)"
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to database
      // await supabase.from("vinyl_catalog").update(editForm).eq("id", vinyl.id);
      
      onUpdate?.(editForm);
      setIsEditDialogOpen(false);
      toast.success("Vinyl uppdaterad!");
    } catch (error) {
      console.error("Error updating vinyl:", error);
      toast.error("Kunde inte uppdatera vinyl");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Är du säker på att du vill ta bort denna vinyl från katalogen?")) {
      return;
    }

    try {
      // TODO: Delete from database
      // await supabase.from("vinyl_catalog").delete().eq("id", vinyl.id);
      
      onDelete?.(vinyl.id);
      toast.success("Vinyl borttagen!");
    } catch (error) {
      console.error("Error deleting vinyl:", error);
      toast.error("Kunde inte ta bort vinyl");
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "";
    return duration;
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "Pris ej satt";
    return `${price} kr`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
          {vinyl.image_url ? (
            <>
              <img
                src={vinyl.image_url}
                alt={`${vinyl.artist} - ${vinyl.title}`}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.error("Vinyl image failed to load:", vinyl.image_url, e);
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  console.log("Vinyl image loaded successfully:", vinyl.image_url);
                }}
              />
              <div 
                className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded"
                style={{ display: 'none' }}
              >
                <Music className="w-6 h-6" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded">
              <Music className="w-6 h-6" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{vinyl.artist}</h4>
          <p className="text-sm text-muted-foreground truncate">{vinyl.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={vinyl.in_stock ? "default" : "secondary"} className="text-xs">
              {vinyl.in_stock ? "I lager" : "Slutsåld"}
            </Badge>
            <span className="text-sm font-medium">{formatPrice(vinyl.price)}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setIsDetailDialogOpen(true)}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          <div className={`aspect-square bg-gray-100 relative ${!vinyl.in_stock ? 'opacity-75' : ''}`}>
            {vinyl.image_url ? (
              <>
                <img
                  src={vinyl.image_url}
                  alt={`${vinyl.artist} - ${vinyl.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error("Vinyl image failed to load:", vinyl.image_url, e);
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                  onLoad={() => {
                    console.log("Vinyl image loaded successfully:", vinyl.image_url);
                  }}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100"
                  style={{ display: 'none' }}
                >
                  <Music className="w-12 h-12" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                <Music className="w-12 h-12" />
              </div>
            )}
            
            <Badge
              className={`absolute top-2 right-2 ${
                vinyl.in_stock ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {vinyl.in_stock ? "I lager" : "Slutsåld"}
            </Badge>
            
            {vinyl.discogs_rating && vinyl.discogs_rating > 0 && (
              <Badge className="absolute top-2 left-2 bg-yellow-500">
                <Heart className="w-3 h-3 mr-1" />
                {vinyl.discogs_rating}/5
              </Badge>
            )}
          </div>
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
              {vinyl.genre && vinyl.genre.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{vinyl.genre.length - 2}
                </Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>{vinyl.year}</span>
              <span>{vinyl.condition || "Skick ej satt"}</span>
            </div>
            
            {vinyl.label && (
              <p className="text-xs text-muted-foreground mb-2">
                {vinyl.label} {vinyl.catalog_number && `• ${vinyl.catalog_number}`}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">{formatPrice(vinyl.price)}</span>
              {vinyl.quantity && vinyl.quantity > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({vinyl.quantity} st)
                </span>
              )}
            </div>
            
            {showActions && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => setIsDetailDialogOpen(true)}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              {vinyl.artist} - {vinyl.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                {vinyl.image_url ? (
                  <>
                    <img
                      src={vinyl.image_url}
                      alt={`${vinyl.artist} - ${vinyl.title}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error("Vinyl image failed to load:", vinyl.image_url, e);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log("Vinyl image loaded successfully:", vinyl.image_url);
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg"
                      style={{ display: 'none' }}
                    >
                      <Music className="w-16 h-16" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">
                    <Music className="w-16 h-16" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={vinyl.in_stock ? "default" : "secondary"}>
                    {vinyl.in_stock ? "I lager" : "Slutsåld"}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Pris:</span>
                  <span className="font-bold">{formatPrice(vinyl.price)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Skick:</span>
                  <span>{vinyl.condition || "Ej satt"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">År:</span>
                  <span>{vinyl.year || "Okänt"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Format:</span>
                  <span>{vinyl.format || "Okänt"}</span>
                </div>
                
                {vinyl.label && (
                  <div className="flex justify-between">
                    <span className="font-medium">Skivbolag:</span>
                    <span>{vinyl.label}</span>
                  </div>
                )}
                
                {vinyl.catalog_number && (
                  <div className="flex justify-between">
                    <span className="font-medium">Katalognr:</span>
                    <span>{vinyl.catalog_number}</span>
                  </div>
                )}
                
                {vinyl.discogs_rating && (
                  <div className="flex justify-between">
                    <span className="font-medium">Discogs betyg:</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-yellow-500" />
                      <span>{vinyl.discogs_rating}/5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              {vinyl.genre && vinyl.genre.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Genrer</h4>
                  <div className="flex flex-wrap gap-1">
                    {vinyl.genre.map(g => (
                      <Badge key={g} variant="secondary">{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {vinyl.style && vinyl.style.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Stilar</h4>
                  <div className="flex flex-wrap gap-1">
                    {vinyl.style.map(s => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {vinyl.tracklist && vinyl.tracklist.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Spårlista</h4>
                  <div className="space-y-1">
                    {vinyl.tracklist.map((track, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{track.position}</span>
                        <span className="flex-1 mx-2">{track.title}</span>
                        <span className="text-muted-foreground">{formatDuration(track.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {vinyl.notes && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Anteckningar</h4>
                  <p className="text-sm text-muted-foreground">{vinyl.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`https://www.discogs.com/release/${vinyl.discogs_id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visa på Discogs
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Redigera
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera Vinyl</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="year">År</Label>
                <Input
                  id="year"
                  type="number"
                  value={editForm.year || ""}
                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || undefined })}
                />
              </div>
              
              <div>
                <Label htmlFor="label">Skivbolag</Label>
                <Input
                  id="label"
                  value={editForm.label || ""}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="catalog_number">Katalognr</Label>
                <Input
                  id="catalog_number"
                  value={editForm.catalog_number || ""}
                  onChange={(e) => setEditForm({ ...editForm, catalog_number: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="condition">Skick</Label>
                <Select
                  value={editForm.condition || ""}
                  onValueChange={(value) => setEditForm({ ...editForm, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj skick" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Välj skick</SelectItem>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price">Pris (kr)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editForm.price || ""}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || undefined })}
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Antal</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={editForm.quantity || 1}
                  onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={editForm.in_stock}
                  onChange={(e) => setEditForm({ ...editForm, in_stock: e.target.checked })}
                />
                <Label htmlFor="in_stock">I lager</Label>
              </div>
              
              <div>
                <Label htmlFor="notes">Anteckningar</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VinylCard;
