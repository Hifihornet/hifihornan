import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Integritetspolicy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Personuppgiftsansvarig</h2>
            <p className="text-foreground/80">
              HiFiHörnet är personuppgiftsansvarig för behandlingen av dina personuppgifter på denna webbplats. 
              HiFiHörnet är ett hobbyprojekt som drivs av privatpersoner.
            </p>
            <p className="text-foreground/80">
              <strong>Kontakt:</strong> För frågor om personuppgiftsbehandling, använd vår supportchatt 
              som du hittar nere till höger på sidan.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Vilka uppgifter vi samlar in</h2>
            <p className="text-foreground/80">Vi samlar in följande typer av personuppgifter:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Kontouppgifter:</strong> E-postadress och lösenord (krypterat) när du skapar ett konto</li>
              <li><strong>Profiluppgifter:</strong> Namn, telefonnummer och ort som du frivilligt väljer att ange</li>
              <li><strong>Annonsuppgifter:</strong> Information och bilder du lägger in i dina annonser</li>
              <li><strong>Kommunikation:</strong> Meddelanden du skickar via plattformen</li>
              <li><strong>Tekniska uppgifter:</strong> IP-adress, webbläsartyp och enhetsuppgifter</li>
              <li><strong>Användningsdata:</strong> Hur du interagerar med vår webbplats</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Rättslig grund för behandling</h2>
            <p className="text-foreground/80">Vi behandlar dina personuppgifter baserat på följande rättsliga grunder enligt GDPR:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Avtal (Art. 6.1.b):</strong> För att tillhandahålla tjänsten, hantera ditt konto och dina annonser</li>
              <li><strong>Berättigat intresse (Art. 6.1.f):</strong> För att förbättra och säkra vår tjänst, samt förhindra missbruk</li>
              <li><strong>Samtycke (Art. 6.1.a):</strong> För annonscookies och nyhetsbrev (du kan när som helst återkalla ditt samtycke)</li>
              <li><strong>Rättslig förpliktelse (Art. 6.1.c):</strong> För att uppfylla lagkrav</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Hur vi använder dina uppgifter</h2>
            <p className="text-foreground/80">Vi använder dina personuppgifter för att:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Tillhandahålla och förbättra våra tjänster</li>
              <li>Hantera ditt konto och dina annonser</li>
              <li>Möjliggöra kommunikation mellan köpare och säljare</li>
              <li>Kommunicera med dig om din användning av tjänsten</li>
              <li>Visa annonser via Google AdSense (med ditt samtycke)</li>
              <li>Analysera och förbättra webbplatsens prestanda</li>
              <li>Förhindra bedrägeri och missbruk</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Delning av uppgifter</h2>
            <p className="text-foreground/80">Vi delar dina uppgifter med:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Andra användare:</strong> Information i dina annonser och din profil är synlig för andra användare</li>
              <li><strong>Tjänsteleverantörer:</strong> Vi använder Supabase för datalagring och autentisering</li>
              <li><strong>Google AdSense:</strong> För annonsvisning (med ditt samtycke)</li>
            </ul>
            <p className="text-foreground/80">
              Vi säljer aldrig dina personuppgifter till tredje part.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Lagring och säkerhet</h2>
            <p className="text-foreground/80">
              Dina uppgifter lagras på säkra servrar inom EU. Vi använder kryptering och andra 
              säkerhetsåtgärder för att skydda dina uppgifter. Lösenord lagras alltid i krypterad form.
            </p>
            <p className="text-foreground/80">
              <strong>Lagringstid:</strong> Vi sparar dina uppgifter så länge du har ett konto hos oss, 
              eller tills du begär radering. Vissa uppgifter kan behållas längre om det krävs enligt lag.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Google AdSense och tredjepartscookies</h2>
            <p className="text-foreground/80">
              Vi använder Google AdSense för att visa annonser på vår webbplats. Google och dess partners 
              kan använda cookies för att visa annonser baserat på ditt besök på denna och andra webbplatser. 
              Du kan välja bort personanpassade annonser genom att besöka{" "}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Googles annonsinställningar
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Dina rättigheter enligt GDPR</h2>
            <p className="text-foreground/80">Enligt dataskyddsförordningen (GDPR) har du följande rättigheter:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Rätt till tillgång:</strong> Du kan begära en kopia av dina personuppgifter</li>
              <li><strong>Rätt till rättelse:</strong> Du kan begära rättelse av felaktiga uppgifter</li>
              <li><strong>Rätt till radering:</strong> Du kan begära att vi raderar dina uppgifter</li>
              <li><strong>Rätt till begränsning:</strong> Du kan begära begränsad behandling</li>
              <li><strong>Rätt till dataportabilitet:</strong> Du kan få ut dina uppgifter i ett maskinläsbart format</li>
              <li><strong>Rätt att invända:</strong> Du kan invända mot behandling baserad på berättigat intresse</li>
              <li><strong>Rätt att återkalla samtycke:</strong> Du kan när som helst återkalla givna samtycken</li>
            </ul>
            <p className="text-foreground/80">
              För att utöva dina rättigheter, kontakta oss via supportchatten. Du har också rätt att 
              lämna in klagomål till Integritetsskyddsmyndigheten (IMY) om du anser att vi behandlar 
              dina uppgifter felaktigt.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Radering av konto</h2>
            <p className="text-foreground/80">
              Du har möjlighet att när som helst radera ditt konto via din profilsida. När du väljer att 
              radera ditt konto sker följande:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Permanent radering:</strong> All din data raderas permanent från våra system</li>
              <li><strong>Profil:</strong> Din profilinformation inklusive namn, ort och biografi raderas</li>
              <li><strong>Annonser:</strong> Alla dina publicerade annonser tas bort</li>
              <li><strong>Meddelanden:</strong> Alla dina meddelanden och konversationer raderas</li>
              <li><strong>Bilder:</strong> Alla uppladdade bilder (profilbild, setup-bilder, annonsbilder) raderas från våra servrar</li>
            </ul>
            <p className="text-foreground/80 mt-4">
              <strong>Viktigt:</strong> Efter att ditt konto har raderats har vi ingen tillgång till din 
              information längre och kan inte återställa några uppgifter. Raderingen är permanent och 
              kan inte ångras.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Ändringar av denna policy</h2>
            <p className="text-foreground/80">
              Vi kan komma att uppdatera denna integritetspolicy. Vid väsentliga ändringar kommer vi 
              att informera dig via webbplatsen. Vi rekommenderar att du regelbundet granskar denna sida.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Kontakt</h2>
            <p className="text-foreground/80">
              Om du har frågor om denna integritetspolicy, vill utöva dina rättigheter enligt GDPR, 
              eller vill begära radering av din information, använd vår supportchatt som du hittar nere 
              till höger på sidan. Du kan också radera ditt konto och all tillhörande data direkt 
              via din profilsida under inställningar.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
