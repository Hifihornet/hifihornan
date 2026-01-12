import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, MessageCircle, Phone, User, Tag, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { mockListings, categories, conditions, Listing } from "@/data/listings";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ChatDialog from "@/components/ChatDialog";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      // First check mock listings
      const mockListing = mockListings.find((l) => l.id === id);
      if (mockListing) {
        setListing(mockListing);
        setLoading(false);
        return;
      }

      // Then check database
      try {
        const { data, error } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            description,
            price,
            category,
            condition,
            brand,
            year,
            location,
            images,
            created_at,
            user_id,
            view_count
          `)
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching listing:", error);
        } else if (data) {
          // Increment view count
          const { error: rpcError } = await supabase.rpc('increment_listing_view', { listing_id: id });
          if (rpcError) {
            console.error("Error incrementing view count:", rpcError);
          }

          // Store seller ID for profile link
          setSellerId(data.user_id);
          
          // Use secure function to get seller display name
          let sellerDisplayName = "Säljare";
          if (data.user_id) {
            const { data: nameData } = await supabase
              .rpc('get_seller_display_name', { _user_id: data.user_id });
            if (nameData) {
              sellerDisplayName = nameData;
            }
          }

          setListing({
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            condition: data.condition,
            brand: data.brand,
            year: data.year,
            location: data.location,
            sellerName: sellerDisplayName,
            sellerEmail: "",
            sellerPhone: undefined,
            images: data.images || [],
            createdAt: data.created_at,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Annonsen hittades inte
            </h1>
            <p className="text-muted-foreground mb-6">
              Den här annonsen kan ha tagits bort eller så är länken felaktig.
            </p>
            <Link to="/browse">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till annonser
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const category = categories.find((c) => c.id === listing.category);
  const condition = conditions.find((c) => c.id === listing.condition);

  const handleStartChat = () => {
    if (!user) {
      toast.error("Du måste logga in för att skicka meddelanden");
      navigate("/auth");
      return;
    }
    if (user.id === sellerId) {
      toast.error("Du kan inte skicka meddelande till dig själv");
      return;
    }
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tillbaka till annonser
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-card border border-border">
                  <img
                    src={listing.images[currentImageIndex] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {listing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${listing.title} bild ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium">
                    {category?.icon} {category?.label}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                    {condition?.label}
                  </span>
                </div>

                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {listing.brand}
                  </span>
                  {listing.year && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {listing.year}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(listing.createdAt).toLocaleDateString("sv-SE")}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="p-6 rounded-xl bg-card border border-border sticky top-24">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">Pris</span>
                  <div className="text-3xl font-display font-bold text-gradient">
                    {listing.price.toLocaleString("sv-SE")} kr
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full"
                    onClick={handleStartChat}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Skicka meddelande
                  </Button>

                  {listing.sellerPhone && (
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <a href={`tel:${listing.sellerPhone.replace(/\s/g, "")}`}>
                        <Phone className="w-4 h-4" />
                        {listing.sellerPhone}
                      </a>
                    </Button>
                  )}
                </div>

                {/* Seller Info */}
                <div className="mt-6 pt-6 border-t border-border">
                  <Link 
                    to={sellerId ? `/profil/${sellerId}` : "#"}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {listing.sellerName}
                      </div>
                      <div className="text-sm text-muted-foreground">Visa profil →</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Ad Banner in Sidebar */}
              <div className="mt-6">
                <AdBanner slot="8997727388" format="rectangle" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chat Dialog */}
      {sellerId && listing && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          listingId={id || ""}
          listingTitle={listing.title}
          sellerId={sellerId}
          sellerName={listing.sellerName}
        />
      )}
    </div>
  );
};

export default ListingDetail;
