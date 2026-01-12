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
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().min(3, "Titeln måste vara minst 3 tecken").max(200, "Titeln får max vara 200 tecken"),
  description: z.string().min(10, "Beskrivningen måste vara minst 10 tecken").max(5000, "Beskrivningen får max vara 5000 tecken"),
  price: z.number().int().positive("Priset måste vara positivt").max(10000000, "Priset får max vara 10 000 000 kr"),
  category: z.string().min(1, "Välj en kategori"),
  condition: z.string().min(1, "Välj skick"),
  brand: z.string().min(1, "Ange märke").max(100, "Märket får max vara 100 tecken"),
  year: z.string().regex(/^\d{4}$/, "År måste vara fyra siffror (t.ex. 1972)").optional().or(z.literal("")),
  location: z.string().min(2, "Ange plats (minst 2 tecken)").max(200, "Platsen får max vara 200 tecken"),
});

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      listingSchema.parse({
        ...formData,
        price: formData.price ? parseInt(formData.price) : 0,
        year: formData.year || undefined,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
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

    if (!validateForm()) {
      toast.error("Kontrollera formuläret");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        category: formData.category,
        condition: formData.condition,
        brand: formData.brand.trim(),
        year: formData.year || null,
        location: formData.location.trim(),
        images: images,
      });

      if (error) {
        console.error("Error creating listing:", error);
        if (error.message.includes("price_range")) {
          toast.error("Priset måste vara mellan 1 och 10 000 000 kr");
        } else if (error.message.includes("title_length")) {
          toast.error("Titeln måste vara mellan 3 och 200 tecken");
        } else if (error.message.includes("description_length")) {
          toast.error("Beskrivningen måste vara mellan 10 och 5000 tecken");
        } else {
          toast.error("Kunde inte skapa annonsen");
        }
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
                    maxLength={200}
                    required
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Beskrivning * <span className="text-xs">({formData.description.length}/5000)</span>
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Beskriv produkten i detalj - skick, historia, eventuella defekter..."
                    rows={5}
                    maxLength={5000}
                    required
                    className="bg-secondary/50 border-border"
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
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
                      min={1}
                      max={10000000}
                      required
                    />
                    {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
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
                      maxLength={200}
                      required
                    />
                    {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
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
                      maxLength={100}
                      required
                    />
                    {errors.brand && <p className="text-destructive text-sm mt-1">{errors.brand}</p>}
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
                      maxLength={4}
                      pattern="\d{4}"
                    />
                    {errors.year && <p className="text-destructive text-sm mt-1">{errors.year}</p>}
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
