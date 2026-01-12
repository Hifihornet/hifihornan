import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { categories, conditions } from "@/data/listings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CreateListing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    brand: "",
    year: "",
    location: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Du måste vara inloggad för att skapa annonser");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Du måste vara inloggad");
      navigate("/auth");
      return;
    }

    if (images.length === 0) {
      toast.error("Lägg till minst en bild");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        condition: formData.condition,
        brand: formData.brand,
        year: formData.year || null,
        location: formData.location,
        images: images,
      });

      if (error) {
        console.error("Error creating listing:", error);
        toast.error("Kunde inte skapa annonsen");
        return;
      }

      toast.success("Annons skapad!", {
        description: "Din annons är nu publicerad och synlig för andra.",
      });
      navigate("/browse");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Något gick fel");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Skapa ny annons
            </h1>
            <p className="text-muted-foreground">
              Fyll i informationen nedan för att publicera din annons
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images */}
            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4">Bilder *</h2>
              <ImageUpload images={images} onImagesChange={setImages} />
            </section>

            {/* Basic Info */}
            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Grundläggande information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Titel *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="t.ex. Marantz 2270 Stereo Receiver"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Beskrivning *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Beskriv produkten i detalj - skick, historia, eventuella defekter..."
                    rows={5}
                    required
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Pris (kr) *
                    </label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="15000"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Plats *
                    </label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="t.ex. Stockholm"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Product Details */}
            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Produktdetaljer
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Kategori *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="flex h-12 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <option value="">Välj kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Skick *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      className="flex h-12 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <option value="">Välj skick</option>
                      {conditions.map((cond) => (
                        <option key={cond.id} value={cond.id}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Märke *
                    </label>
                    <Input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="t.ex. Marantz, Technics, JBL"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Tillverkningsår
                    </label>
                    <Input
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="t.ex. 1972"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                variant="glow" 
                size="xl" 
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Publicera annons
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xl"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Avbryt
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;
