import { Link } from "react-router-dom";
import { Search, ArrowRight, Disc, Radio, Speaker, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { mockListings, categories } from "@/data/listings";
import heroImage from "@/assets/hero-hifi.jpg";

const Index = () => {
  const featuredListings = mockListings.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4 animate-fade-in-up">
              Sveriges marknadsplats för vintage audio
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up delay-100">
              Hitta din nästa{" "}
              <span className="text-gradient">klassiska HiFi</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl animate-fade-in-up delay-200">
              Köp och sälj vintage förstärkare, högtalare, skivspelare och mer. 
              Direkt mellan privatpersoner, utan mellanhänder.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up delay-300">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Sök bland annonser..."
                  className="pl-12 h-14 text-base"
                />
              </div>
              <Link to="/browse">
                <Button variant="glow" size="xl" className="w-full sm:w-auto">
                  Bläddra annonser
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground animate-fade-in-up delay-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {mockListings.length}+ aktiva annonser
              </span>
              <span>•</span>
              <span>Gratis att sälja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bläddra efter kategori
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hitta exakt det du letar efter bland våra populära kategorier
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category, index) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift text-center"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Senaste annonser
              </h2>
              <p className="text-muted-foreground">
                Nyligen tillagda klassiska ljudprylar
              </p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="hidden sm:flex">
                Visa alla
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/browse">
              <Button variant="outline">
                Visa alla annonser
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <Disc className="w-8 h-8 text-primary animate-pulse-glow" />
              <Radio className="w-8 h-8 text-accent" />
              <Speaker className="w-8 h-8 text-primary animate-pulse-glow" />
              <Headphones className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Har du HiFi att sälja?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Lägg upp din klassiska ljudutrustning gratis och nå tusentals entusiaster 
              som letar efter precis det du har.
            </p>
            <Link to="/create">
              <Button variant="glow" size="xl">
                Lägg upp gratis annons
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
