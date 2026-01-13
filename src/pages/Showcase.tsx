import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, User, Plus, Loader2, X, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Showcase {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  equipment: string[] | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
}

const Showcase = () => {
  const { user } = useAuth();
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newShowcase, setNewShowcase] = useState({
    title: "",
    description: "",
    equipment: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const { data, error } = await supabase
        .from("setup_showcases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const showcasesWithUsers = await Promise.all(
        (data || []).map(async (showcase) => {
          const { data: profile } = await supabase
            .rpc("get_public_profile_by_user_id", { _user_id: showcase.user_id });

          return {
            ...showcase,
            user_name: profile?.[0]?.display_name || "Anonym",
            user_avatar: profile?.[0]?.avatar_url || null,
          };
        })
      );

      setShowcases(showcasesWithUsers);
    } catch (err) {
      console.error("Error fetching showcases:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const urls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/showcase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("setup-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("setup-images")
          .getPublicUrl(fileName);

        urls.push(urlData.publicUrl);
      }

      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Error uploading images:", err);
      toast.error("Kunde inte ladda upp bilderna");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateShowcase = async () => {
    if (!user) {
      toast.error("Du måste logga in");
      return;
    }

    if (!newShowcase.title.trim()) {
      toast.error("Ange en titel");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error("Ladda upp minst en bild");
      return;
    }

    setSubmitting(true);
    try {
      const equipment = newShowcase.equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const { error } = await supabase.from("setup_showcases").insert({
        user_id: user.id,
        title: newShowcase.title,
        description: newShowcase.description || null,
        images: uploadedImages,
        equipment: equipment.length > 0 ? equipment : null,
      });

      if (error) throw error;

      toast.success("Din setup är publicerad!");
      setCreateOpen(false);
      setNewShowcase({ title: "", description: "", equipment: "" });
      setUploadedImages([]);
      fetchShowcases();
    } catch (err) {
      console.error("Error creating showcase:", err);
      toast.error("Kunde inte publicera");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (showcaseId: string) => {
    if (!user) {
      toast.error("Logga in för att gilla");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("showcase_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("showcase_id", showcaseId)
        .single();

      if (existing) {
        await supabase.from("showcase_likes").delete().eq("id", existing.id);
      } else {
        await supabase.from("showcase_likes").insert({
          user_id: user.id,
          showcase_id: showcaseId,
        });
      }

      fetchShowcases();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold">HiFi-Showcase</h1>
                <p className="text-muted-foreground">Visa upp din ljudanläggning</p>
              </div>
            </div>

            {user && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Dela din setup
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Dela din HiFi-setup</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Titel *</Label>
                      <Input
                        placeholder="T.ex. 'Min vardagsrumssystem'"
                        value={newShowcase.title}
                        onChange={(e) => setNewShowcase({ ...newShowcase, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Beskrivning</Label>
                      <Textarea
                        placeholder="Berätta om din setup..."
                        value={newShowcase.description}
                        onChange={(e) => setNewShowcase({ ...newShowcase, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Utrustning (separera med komma)</Label>
                      <Input
                        placeholder="T.ex. Marantz 2270, JBL L100, Technics SL-1200"
                        value={newShowcase.equipment}
                        onChange={(e) => setNewShowcase({ ...newShowcase, equipment: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bilder *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center">
                          {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Avbryt
                    </Button>
                    <Button onClick={handleCreateShowcase} disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Publicera
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : showcases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcases.map((showcase) => (
                <div
                  key={showcase.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={showcase.images[0]}
                      alt={showcase.title}
                      className="w-full h-full object-cover"
                    />
                    {showcase.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        +{showcase.images.length - 1} bilder
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{showcase.title}</h3>
                    {showcase.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {showcase.description}
                      </p>
                    )}

                    {showcase.equipment && showcase.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {showcase.equipment.slice(0, 3).map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-secondary text-xs rounded-full"
                          >
                            {eq}
                          </span>
                        ))}
                        {showcase.equipment.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{showcase.equipment.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {showcase.user_avatar ? (
                            <img src={showcase.user_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <span className="text-sm">{showcase.user_name}</span>
                      </div>

                      <button
                        onClick={() => handleLike(showcase.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        {showcase.likes_count}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
              <div className="text-6xl mb-4">🎧</div>
              <h2 className="text-xl font-semibold mb-2">Inga setups ännu</h2>
              <p className="text-muted-foreground mb-6">
                Bli först med att dela din HiFi-anläggning!
              </p>
              {user && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Dela din setup
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Showcase;
