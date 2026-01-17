import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, MapPin, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { categories, conditions } from "@/data/listings";
import PriceSuggestion from "@/components/PriceSuggestion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { MobileOptimizedButton } from "@/components/ui/mobile-optimized-button";
import { MobileOptimizedInput } from "@/components/ui/mobile-optimized-input";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCamera } from "@/hooks/useCamera";

const listingSchema = z.object({
  title: z.string().min(3, "Titeln måste vara minst 3 tecken").max(200, "Titeln får max vara 200 tecken"),
  description: z.string().min(10, "Beskrivningen måste vara minst 10 tecken").max(5000, "Beskrivningen får max vara 5000 tecken"),
  price: z.number().int().positive("Priset måste vara positivt").max(10000000, "Priset får max vara 10 000 000 kr"),
  category: z.string().min(1, "Välj en kategori"),
  condition: z.string().min(1, "Välj skick"),
  year: z.string().regex(/^\d{4}$/, "År måste vara fyra siffror (t.ex. 1972)").optional().or(z.literal("")),
  location: z.string().min(2, "Ange plats (minst 2 tecken)").max(200, "Platsen får max vara 200 tecken"),
});

const CreateListing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Scroll to top on route change
  useScrollToTop();
  
  // Mobile optimization
  const { isMobile, isTablet, getResponsiveClass, getResponsiveValue } = useMobileOptimization();
  
  // Error handling
  const { showError, showSuccess } = useErrorToast();
  
  // GPS and Camera hooks
  const { getCurrentLocation, getCityFromLocation, loading: locationLoading } = useGeolocation();
  const { images: cameraImages, openCamera, openGallery, removeImage, fileInputRef } = useCamera();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    brand: "",
    year: "",
    location: "",
    hasAmplifier: false,
    hasTapeDeck: false,
    hasCdPlayer: false,
    hasPhono: false,
    bluetooth: false,
    remote: false,
    originalBox: false,
    manual: false,
    hasTurntable: false,
    hasTonearm: false,
    isDigital: false,
    images: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!formData.location) {
      getCurrentLocation().then(location => {
        if (location) {
          const city = getCityFromLocation(location);
          setFormData(prev => ({ ...prev, location: city }));
        }
      }).catch(err => {
        console.log('Could not get location:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Du måste vara inloggad för att skapa annonser");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
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
          if (error.path.length > 0) {
            newErrors[error.path[0]] = error.message;
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
      // @ts-ignore - Database schema differs from TypeScript types
      const { error } = await supabase.from("listings").insert({
        user_id: user.id, // Use user_id to match TypeScript types (maps to seller_id in DB)
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        status: "active", // Default status
        images: images, // Add images to insert
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
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Skapa ny annons
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Fyll i informationen nedan för att publicera din annons
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Images */}
            <section className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-foreground text-lg sm:text-xl">Bilder *</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCamera}
                    disabled={cameraImages.length >= 10}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {isMobile ? 'Kamera' : 'Ta bild'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openGallery}
                    disabled={cameraImages.length >= 10}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isMobile ? 'Galleri' : 'Välj filer'}
                  </Button>
                </div>
              </div>
              
              {/* Camera images preview */}
              {cameraImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                  {cameraImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Bild ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newImages = files.map(file => URL.createObjectURL(file));
                  setImages(prev => [...prev, ...newImages]);
                }}
                className="hidden"
              />
              
              <ImageUpload images={images} onImagesChange={setImages} />
            </section>

            {/* Basic Info */}
            <section className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4 text-lg sm:text-xl">
                Grundläggande information
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                    Titel *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="t.ex. Marantz 2270 Stereo Receiver"
                    maxLength={200}
                    required
                    className="text-base sm:text-lg h-12 sm:h-14"
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                    Beskrivning * <span className="text-xs">({formData.description.length}/5000)</span>
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Beskriv din HiFi-utrustning detaljerat..."
                    rows={4}
                    maxLength={5000}
                    required
                    className="text-base sm:text-lg resize-none"
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
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
                      className="text-base sm:text-lg h-12 sm:h-14"
                    />
                    {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                      Plats *
                    </label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="t.ex. Stockholm"
                      maxLength={200}
                      required
                      className="text-base sm:text-lg h-12 sm:h-14"
                    />
                    {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
                  </div>
                </div>

                {/* Price Suggestion */}
                {formData.brand || formData.category || formData.condition || formData.year || formData.title ? (
                  <PriceSuggestion
                    brand={formData.brand}
                    category={formData.category}
                    condition={formData.condition}
                    year={formData.year ? parseInt(formData.year) : undefined}
                    hasAmplifier={formData.hasAmplifier}
                    hasTurntable={formData.hasTurntable}
                    hasTonearm={formData.hasTonearm}
                    isDigital={formData.isDigital}
                    title={formData.title}
                  />
                ) : null}
              </div>
            </section>

            {/* Product Details */}
            <section className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-4 text-lg sm:text-xl">
                Produktdetaljer
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                      Kategori *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="flex h-12 sm:h-14 w-full rounded-lg border border-border bg-background px-4 py-3 text-base sm:text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer hover:bg-accent/50 transition-colors pr-10"
                    >
                      <option value="" className="text-muted-foreground">Välj kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="text-foreground">
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-7">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                      Skick *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      className="flex h-12 sm:h-14 w-full rounded-lg border border-border bg-background px-4 py-3 text-base sm:text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer hover:bg-accent/50 transition-colors pr-10"
                    >
                      <option value="" className="text-muted-foreground">Välj skick</option>
                      {conditions.map((cond) => (
                        <option key={cond.id} value={cond.id} className="text-foreground">
                          {cond.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-7">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* HiFi-specifika fält */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                      Märke
                    </label>
                    <Input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="t.ex. Marantz, Rega, McIntosh"
                      maxLength={100}
                      className="text-base sm:text-lg h-12 sm:h-14"
                    />
                  </div>
                  <div>
                    <label className="text-sm sm:text-base text-muted-foreground mb-1.5 block">
                      Årt
                    </label>
                    <Input
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="t.ex. 1972"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="text-base sm:text-lg h-12 sm:h-14"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm sm:text-base text-muted-foreground mb-3 block">
                      HiFi-komponenter
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input
                          type="checkbox"
                          name="hasAmplifier"
                          checked={formData.hasAmplifier}
                          onChange={handleChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border"
                        />
                        <span className="text-sm sm:text-base">Förstärkare</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input
                          type="checkbox"
                          name="hasTurntable"
                          checked={formData.hasTurntable}
                          onChange={handleChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border"
                        />
                        <span className="text-sm sm:text-base">Spelare</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input
                          type="checkbox"
                          name="hasTonearm"
                          checked={formData.hasTonearm}
                          onChange={handleChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border"
                        />
                        <span className="text-sm sm:text-base">Tonarm</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input
                          type="checkbox"
                          name="isDigital"
                          checked={formData.isDigital}
                          onChange={handleChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border"
                        />
                        <span className="text-sm sm:text-base">Digital</span>
                      </label>
                    </div>
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
                className="flex-1 h-14 sm:h-16 text-base sm:text-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Publicerar...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                className="h-14 sm:h-16 text-base sm:text-lg"
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
