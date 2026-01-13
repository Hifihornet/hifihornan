import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Heart, Music, Users, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>Om oss - Hifihörnan</title>
        <meta
          name="description"
          content="Lär känna Hifihörnan - marknadsplatsen för HiFi-entusiaster. Läs om vår vision och hur du kan stödja projektet."
        />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Om Hifihörnan
                </h1>
                <p className="text-lg text-muted-foreground">
                  En mötesplats för alla som älskar klassisk HiFi-utrustning
                </p>
              </div>
            </div>
          </section>

          {/* About Content */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto space-y-12">
                {/* Vision */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      Vår vision
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Hifihörnan skapades ur en passion för klassisk HiFi-utrustning och en önskan 
                    att ge entusiaster en dedikerad plats att köpa och sälja kvalitetsutrustning. 
                    Vi tror på att bevara och sprida kärleken till analog musik och den unika 
                    ljudupplevelse som bara vintage-HiFi kan ge.
                  </p>
                </div>

                {/* Community */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      Vår gemenskap
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Hifihörnan är mer än bara en marknadsplats – det är en gemenskap av 
                    likasinnade människor som delar samma passion. Här kan du hitta allt från 
                    klassiska förstärkare och högtalare till sällsynta skivspelare och 
                    receivers. Vår plattform gör det enkelt att hitta din nästa skatt eller 
                    ge ett gammalt fynd ett nytt hem.
                  </p>
                </div>

                {/* Support Section */}
                <div className="bg-card border border-border rounded-xl p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-glow/20">
                      <Heart className="h-6 w-6 text-glow" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      Stöd projektet
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Hifihörnan är ett hobbyprojekt som drivs av passion och kärlek till HiFi. 
                    Om du gillar vad vi gör och vill hjälpa oss att fortsätta utveckla 
                    plattformen, kan du stödja oss via GoFundMe. Varje bidrag, stort som litet, 
                    hjälper oss att täcka serverkostnader och fortsätta förbättra upplevelsen 
                    för alla användare.
                  </p>
                  <Button asChild className="gap-2">
                    <a 
                      href="https://gofundme.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Heart className="h-4 w-4" />
                      Stöd oss på GoFundMe
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Tack för att du är en del av Hifihörnan! ❤️
                  </p>
                </div>

                {/* Contact */}
                <div className="text-center pt-8 border-t border-border">
                  <p className="text-muted-foreground">
                    Har du frågor eller förslag? Kontakta oss på{" "}
                    <a 
                      href="mailto:support@hifihornan.se" 
                      className="text-primary hover:underline"
                    >
                      support@hifihornan.se
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
