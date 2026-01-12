import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, conditions } from "@/data/listings";
import { toast } from "sonner";

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    brand: "",
    year: "",
    location: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
  });
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = () => {
    // Simulate image upload - in real app would use file input
    const placeholderImages = ["/placeholder.svg"];
    setImages([...images, ...placeholderImages]);
    toast.success("Bild tillagd!");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Annons skapad!", {
      description: "Din annons är nu publicerad och synlig för andra.",
    });
    navigate("/browse");
  };

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
              <h2 className="font-display font-semibold text-foreground mb-4">Bilder</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg bg-secondary relative overflow-hidden group"
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-xs">Lägg till</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Lägg till upp till 8 bilder. Första bilden blir huvudbild.
              </p>
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

            {/* Seller Info */}
            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Dina kontaktuppgifter
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Ditt namn *
                    </label>
                    <Input
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleChange}
                      placeholder="Förnamn"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      E-post *
                    </label>
                    <Input
                      name="sellerEmail"
                      type="email"
                      value={formData.sellerEmail}
                      onChange={handleChange}
                      placeholder="din@email.se"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Telefon (valfritt)
                  </label>
                  <Input
                    name="sellerPhone"
                    value={formData.sellerPhone}
                    onChange={handleChange}
                    placeholder="070-123 45 67"
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" variant="glow" size="xl" className="flex-1">
                <Upload className="w-5 h-5" />
                Publicera annons
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xl"
                onClick={() => navigate(-1)}
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
