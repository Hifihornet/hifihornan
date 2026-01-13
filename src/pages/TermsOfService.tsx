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
              Läs igenom dem noggrant innan du börjar använda tjänsten. Om du inte accepterar villkoren 
              ber vi dig att inte använda tjänsten.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Om tjänsten</h2>
            <p className="text-foreground/80">
              HiFiHörnet är en kostnadsfri marknadsplats som möjliggör för privatpersoner att köpa och sälja 
              vintage HiFi-utrustning. Vi tillhandahåller endast en plattform för att underlätta 
              kontakten mellan köpare och säljare.
            </p>
            <p className="text-foreground/80">
              <strong>Tjänsten är gratis</strong> – det kostar inget att skapa konto, lägga upp annonser 
              eller kontakta andra användare.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Användarkonto</h2>
            <p className="text-foreground/80">
              För att lägga upp annonser eller kontakta säljare krävs ett användarkonto. Du ansvarar för att:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Ange korrekta uppgifter vid registrering</li>
              <li>Hålla dina inloggningsuppgifter hemliga</li>
              <li>Meddela oss om du misstänker obehörig åtkomst till ditt konto</li>
              <li>Du måste vara minst 18 år för att använda tjänsten</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Ansvar och regler</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">4.1 Användarens ansvar</h3>
                <p className="text-foreground/80">
                  Som användare av HiFiHörnet ansvarar du fullt ut för:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-2">
                  <li>Innehållet i dina annonser, inklusive beskrivningar, bilder och prissättning</li>
                  <li>Att informationen i dina annonser är korrekt och sanningsenlig</li>
                  <li>Att du har rätt att sälja de produkter du annonserar</li>
                  <li>Att du har rätt att använda de bilder du laddar upp</li>
                  <li>All kommunikation med andra användare</li>
                  <li>Genomförande av köp och försäljning</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">4.2 HiFiHörnets roll</h3>
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
                  <li>Skador eller förluster som uppstår genom användning av tjänsten</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">4.3 Förbjudet innehåll och beteende</h3>
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
                  <li>Spam eller upprepade likadana annonser</li>
                  <li>Att skapa flera konton för att kringgå regler</li>
                  <li>Att samla in andra användares uppgifter utan samtycke</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Annonsregler</h2>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Annonser ska endast innehålla HiFi-relaterad utrustning</li>
              <li>Beskrivningar ska vara sanningsenliga och tydliga</li>
              <li>Bilder ska visa den faktiska produkten som säljs</li>
              <li>Priser ska anges i svenska kronor (SEK)</li>
              <li>En annons får endast innehålla en produkt (eller ett set)</li>
              <li>Du får endast annonsera produkter du har rätt att sälja</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Borttagning av annonser och konton</h2>
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
              Vid upprepade eller allvarliga överträdelser kan vi stänga av användarkonton permanent 
              utan förvarning.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Säkerhetstips</h2>
            <p className="text-foreground/80">
              För din egen säkerhet rekommenderar vi att du:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Möts på en offentlig plats vid överlämning</li>
              <li>Inspekterar produkten noggrant innan betalning</li>
              <li>Använder säkra betalningsmetoder (t.ex. Swish vid överlämningstillfället)</li>
              <li>Är vaksam mot för goda erbjudanden</li>
              <li>Aldrig lämnar ut känslig personlig information</li>
              <li>Rapporterar misstänkt bedrägeri till oss</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Immaterialrätt</h2>
            <p className="text-foreground/80">
              HiFiHörnets logotyp, design och kod är skyddade av upphovsrätt. Du får inte kopiera, 
              modifiera eller distribuera vårt material utan skriftligt tillstånd.
            </p>
            <p className="text-foreground/80">
              Genom att ladda upp innehåll på HiFiHörnet ger du oss rätt att visa detta innehåll 
              på plattformen. Du behåller äganderätten till ditt eget innehåll.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Ansvarsbegränsning</h2>
            <p className="text-foreground/80">
              HiFiHörnet tillhandahålls "i befintligt skick" utan garantier. Vi ansvarar inte för:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Avbrott eller fel i tjänsten</li>
              <li>Förlust av data</li>
              <li>Direkta eller indirekta skador som uppstår genom användning av tjänsten</li>
              <li>Handlingar eller underlåtenheter av andra användare</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Ändringar av villkoren</h2>
            <p className="text-foreground/80">
              Vi kan komma att uppdatera dessa användarvillkor. Vid väsentliga ändringar 
              kommer vi att informera våra användare via webbplatsen. Fortsatt användning 
              av tjänsten efter ändringar innebär att du accepterar de nya villkoren.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Tillämplig lag</h2>
            <p className="text-foreground/80">
              Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand 
              lösas genom dialog. Om det inte är möjligt avgörs tvisten i svensk domstol.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Kontakt</h2>
            <p className="text-foreground/80">
              Om du har frågor om dessa användarvillkor eller vill rapportera en annons, 
              använd vår supportchatt som du hittar nere till höger på sidan.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
