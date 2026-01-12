import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Mail, Phone, User, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockListings, categories, conditions } from "@/data/listings";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ListingDetail = () => {
  const { id } = useParams();
  const listing = mockListings.find((l) => l.id === id);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Meddelande skickat!", {
      description: `Ditt meddelande till ${listing.sellerName} har skickats.`,
    });
    setShowContact(false);
    setMessage("");
    setName("");
    setEmail("");
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
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-card border border-border">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
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
                    onClick={() => setShowContact(!showContact)}
                  >
                    <Mail className="w-4 h-4" />
                    Kontakta säljaren
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
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{listing.sellerName}</div>
                      <div className="text-sm text-muted-foreground">Säljare</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              {showContact && (
                <div className="p-6 rounded-xl bg-card border border-border animate-fade-in-up">
                  <h3 className="font-display font-semibold text-foreground mb-4">
                    Skicka meddelande
                  </h3>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Ditt namn
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ange ditt namn"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Din e-post
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="din@email.se"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Meddelande
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hej! Jag är intresserad av "${listing.title}"...`}
                        rows={4}
                        required
                        className="bg-secondary/50 border-border focus:border-primary/50"
                      />
                    </div>
                    <Button type="submit" variant="glow" className="w-full">
                      Skicka meddelande
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetail;
