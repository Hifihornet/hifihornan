import { useState, useEffect, useCallback } from "react";
import { 
  Loader2, 
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  condition: string;
  location: string;
  status: string;
  year: string | null;
}

interface AdminListingEditorProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const CATEGORIES = [
  "Förstärkare",
  "Högtalare", 
  "Skivspelare",
  "CD-spelare",
  "Kassettdäck",
  "Tuner",
  "Receiver",
  "Övrigt"
];

const CONDITIONS = [
  { value: "mint", label: "Nyskick" },
  { value: "excellent", label: "Utmärkt" },
  { value: "good", label: "Bra" },
  { value: "fair", label: "Acceptabelt" },
  { value: "poor", label: "För delar" }
];

const STATUSES = [
  { value: "active", label: "Aktiv" },
  { value: "sold", label: "Såld" },
  { value: "hidden", label: "Dold" },
  { value: "reserved", label: "Reserverad" }
];

const AdminListingEditor = ({ listingId, open, onOpenChange, onSave }: AdminListingEditorProps) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchListing = useCallback(async () => {
    if (!listingId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, description, price, category, brand, condition, location, status, year")
        .eq("id", listingId)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (err) {
      console.error("Error fetching listing:", err);
      toast.error("Kunde inte hämta annonsen");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [listingId, onOpenChange]);

  useEffect(() => {
    if (listingId && open) {
      fetchListing();
    }
  }, [listingId, open, fetchListing]);

  const handleSave = async () => {
    if (!listing) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          brand: listing.brand,
          condition: listing.condition,
          location: listing.location,
          status: listing.status,
          year: listing.year,
          updated_at: new Date().toISOString()
        })
        .eq("id", listing.id);

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_activity_log").insert({
          admin_id: user.id,
          action_type: "edit_listing",
          target_type: "listing",
          target_id: listing.id,
          details: { title: listing.title }
        });
      }

      toast.success("Annons uppdaterad");
      onSave();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating listing:", err);
      toast.error("Kunde inte uppdatera annonsen");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Listing>(field: K, value: Listing[K]) => {
    if (!listing) return;
    setListing({ ...listing, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redigera annons</DialogTitle>
          <DialogDescription>
            Uppdatera annonsens information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : listing ? (
          <div className="space-y-4 py-4">
            <div>
              <Label>Titel</Label>
              <Input
                value={listing.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Annonstitel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pris (kr)</Label>
                <Input
                  type="number"
                  value={listing.price}
                  onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={listing.status}
                  onValueChange={(value) => updateField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kategori</Label>
                <Select
                  value={listing.category}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Skick</Label>
                <Select
                  value={listing.condition}
                  onValueChange={(value) => updateField("condition", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Märke</Label>
                <Input
                  value={listing.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  placeholder="T.ex. Marantz"
                />
              </div>
              <div>
                <Label>Årsmodell</Label>
                <Input
                  value={listing.year || ""}
                  onChange={(e) => updateField("year", e.target.value || null)}
                  placeholder="T.ex. 1975"
                />
              </div>
            </div>

            <div>
              <Label>Plats</Label>
              <Input
                value={listing.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="T.ex. Stockholm"
              />
            </div>

            <div>
              <Label>Beskrivning</Label>
              <Textarea
                value={listing.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Beskrivning av annonsen..."
                rows={6}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Kunde inte ladda annonsen
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-1" />
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || !listing}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Spara ändringar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminListingEditor;
