import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Plus, Trash2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/data/listings";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  category: string | null;
  min_price: number | null;
  max_price: number | null;
  location: string | null;
  keywords: string | null;
  notify_email: boolean;
  created_at: string;
}

const SavedSearches = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    keywords: "",
    notifyEmail: true,
  });

  useEffect(() => {
    if (user) {
      fetchSearches();
    }
  }, [user]);

  const fetchSearches = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (err) {
      console.error("Error fetching saved searches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!newSearch.name.trim()) {
      toast.error("Ange ett namn för bevakningen");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("saved_searches").insert({
        user_id: user.id,
        name: newSearch.name,
        category: newSearch.category || null,
        min_price: newSearch.minPrice ? Number(newSearch.minPrice) : null,
        max_price: newSearch.maxPrice ? Number(newSearch.maxPrice) : null,
        location: newSearch.location || null,
        keywords: newSearch.keywords || null,
        notify_email: newSearch.notifyEmail,
      });

      if (error) throw error;

      toast.success("Bevakning skapad!");
      setCreateOpen(false);
      setNewSearch({
        name: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        location: "",
        keywords: "",
        notifyEmail: true,
      });
      fetchSearches();
    } catch (err) {
      console.error("Error creating saved search:", err);
      toast.error("Kunde inte skapa bevakning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success("Bevakning borttagen");
    } catch (err) {
      console.error("Error deleting saved search:", err);
      toast.error("Kunde inte ta bort bevakning");
    }
  };

  const toggleNotify = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("saved_searches")
        .update({ notify_email: !currentValue })
        .eq("id", id);

      if (error) throw error;

      setSearches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, notify_email: !currentValue } : s))
      );
    } catch (err) {
      console.error("Error updating saved search:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Logga in för att skapa bevakningar</h1>
            <p className="text-muted-foreground mb-6">
              Få notiser när nya annonser matchar dina kriterier.
            </p>
            <Link to="/auth">
              <Button variant="glow">Logga in</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/browse" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold">Mina bevakningar</h1>
                <p className="text-muted-foreground">
                  Få notiser när nya annonser matchar
                </p>
              </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Ny bevakning
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Skapa bevakning</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Namn på bevakning *</Label>
                    <Input
                      placeholder="T.ex. 'Marantz-förstärkare'"
                      value={newSearch.name}
                      onChange={(e) => setNewSearch({ ...newSearch, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                      value={newSearch.category}
                      onValueChange={(v) => setNewSearch({ ...newSearch, category: v })}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min pris</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newSearch.minPrice}
                        onChange={(e) => setNewSearch({ ...newSearch, minPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max pris</Label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={newSearch.maxPrice}
                        onChange={(e) => setNewSearch({ ...newSearch, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Plats</Label>
                    <Input
                      placeholder="T.ex. Stockholm"
                      value={newSearch.location}
                      onChange={(e) => setNewSearch({ ...newSearch, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nyckelord</Label>
                    <Input
                      placeholder="T.ex. 'vintage 1970'"
                      value={newSearch.keywords}
                      onChange={(e) => setNewSearch({ ...newSearch, keywords: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <Label>E-postnotiser</Label>
                    <Switch
                      checked={newSearch.notifyEmail}
                      onCheckedChange={(v) => setNewSearch({ ...newSearch, notifyEmail: v })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleCreate} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Skapa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searches.length > 0 ? (
            <div className="space-y-4">
              {searches.map((search) => (
                <div
                  key={search.id}
                  className="p-4 bg-card rounded-xl border border-border flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{search.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {search.category && (
                        <span className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                          {categories.find((c) => c.id === search.category)?.label}
                        </span>
                      )}
                      {(search.min_price || search.max_price) && (
                        <span className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                          {search.min_price || 0} - {search.max_price || "∞"} kr
                        </span>
                      )}
                      {search.location && (
                        <span className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                          {search.location}
                        </span>
                      )}
                      {search.keywords && (
                        <span className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                          "{search.keywords}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Bell className={`w-4 h-4 ${search.notify_email ? "text-primary" : "text-muted-foreground"}`} />
                      <Switch
                        checked={search.notify_email}
                        onCheckedChange={() => toggleNotify(search.id, search.notify_email)}
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ta bort bevakning?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill ta bort "{search.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(search.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Ta bort
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Inga bevakningar ännu</h2>
              <p className="text-muted-foreground mb-6">
                Skapa en bevakning för att få notiser om nya annonser.
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Skapa bevakning
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SavedSearches;
