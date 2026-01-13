import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Användarvillkor</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Inledning</h2>
            <p className="text-foreground/80">
              Välkommen till HiFiHörnet. Genom att använda vår webbplats accepterar du dessa användarvillkor. 
              Läs igenom dem noggrant innan du börjar använda tjänsten.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Om tjänsten</h2>
            <p className="text-foreground/80">
              HiFiHörnet är en marknadsplats som möjliggör för privatpersoner att köpa och sälja 
              vintage HiFi-utrustning. Vi tillhandahåller endast en plattform för att underlätta 
              kontakten mellan köpare och säljare.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Ansvar och regler</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">3.1 Användarens ansvar</h3>
                <p className="text-foreground/80">
                  Som användare av HiFiHörnet ansvarar du fullt ut för:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-2">
                  <li>Innehållet i dina annonser, inklusive beskrivningar, bilder och prissättning</li>
                  <li>Att informationen i dina annonser är korrekt och sanningsenlig</li>
                  <li>Att du har rätt att sälja de produkter du annonserar</li>
                  <li>All kommunikation med andra användare</li>
                  <li>Genomförande av köp och försäljning</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">3.2 HiFiHörnets roll</h3>
                <p className="text-foreground/80">
                  <strong>Viktigt att förstå:</strong> HiFiHörnet är inte part i någon affär som sker mellan 
                  användare. Vi förmedlar endast kontakt mellan köpare och säljare och tar inget ansvar för:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-2">
                  <li>Produkternas skick, kvalitet eller äkthet</li>
                  <li>Att transaktioner genomförs</li>
                  <li>Betalningar mellan användare</li>
                  <li>Leverans eller upphämtning av produkter</li>
                  <li>Tvister mellan köpare och säljare</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">3.3 Förbjudet innehåll</h3>
                <p className="text-foreground/80">
                  Följande är inte tillåtet på HiFiHörnet:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-2">
                  <li>Annonser för stulna produkter</li>
                  <li>Förfalskade eller piratkopierade produkter</li>
                  <li>Produkter som inte är relaterade till HiFi/ljudutrustning</li>
                  <li>Olagliga produkter eller tjänster</li>
                  <li>Vilseledande eller bedrägliga annonser</li>
                  <li>Kränkande, hotfullt eller olämpligt innehåll</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Borttagning av annonser</h2>
            <p className="text-foreground/80">
              Vi förbehåller oss rätten att utan förvarning ta bort annonser som:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Bryter mot dessa användarvillkor</li>
              <li>Innehåller olagligt innehåll</li>
              <li>Rapporteras och bedöms vara olämpliga</li>
              <li>Misstänks vara bedrägliga</li>
            </ul>
            <p className="text-foreground/80 mt-4">
              Vid upprepade överträdelser kan vi stänga av användarkonton permanent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Säkerhetstips</h2>
            <p className="text-foreground/80">
              För din egen säkerhet rekommenderar vi att du:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Möts på en offentlig plats vid överlämning</li>
              <li>Inspekterar produkten noggrant innan betalning</li>
              <li>Använder säkra betalningsmetoder</li>
              <li>Är vaksam mot för goda erbjudanden</li>
              <li>Aldrig lämnar ut känslig personlig information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Ändringar av villkoren</h2>
            <p className="text-foreground/80">
              Vi kan komma att uppdatera dessa användarvillkor. Vid väsentliga ändringar 
              kommer vi att informera våra användare via webbplatsen.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Kontakt</h2>
            <p className="text-foreground/80">
              Om du har frågor om dessa användarvillkor eller vill rapportera en annons, 
              använd vår chattbot som du hittar nere till höger på sidan.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
