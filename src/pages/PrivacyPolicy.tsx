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
            <h2 className="text-2xl font-semibold">1. Inledning</h2>
            <p className="text-foreground/80">
              Hifihörnet värnar om din personliga integritet. Denna integritetspolicy förklarar hur vi samlar in, 
              använder och skyddar dina personuppgifter när du använder vår webbplats.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Vilka uppgifter vi samlar in</h2>
            <p className="text-foreground/80">Vi kan samla in följande typer av personuppgifter:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Kontouppgifter:</strong> E-postadress och lösenord när du skapar ett konto</li>
              <li><strong>Profiluppgifter:</strong> Namn, telefonnummer och ort som du väljer att ange</li>
              <li><strong>Annonsuppgifter:</strong> Information du lägger in i dina annonser</li>
              <li><strong>Tekniska uppgifter:</strong> IP-adress, webbläsartyp och enhetsuppgifter</li>
              <li><strong>Användningsdata:</strong> Hur du interagerar med vår webbplats</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Hur vi använder dina uppgifter</h2>
            <p className="text-foreground/80">Vi använder dina personuppgifter för att:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Tillhandahålla och förbättra våra tjänster</li>
              <li>Hantera ditt konto och dina annonser</li>
              <li>Kommunicera med dig om din användning av tjänsten</li>
              <li>Visa relevanta annonser via Google AdSense</li>
              <li>Analysera och förbättra webbplatsens prestanda</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Google AdSense och tredjepartscookies</h2>
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
            <h2 className="text-2xl font-semibold">5. Dina rättigheter</h2>
            <p className="text-foreground/80">Enligt GDPR har du rätt att:</p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Få tillgång till dina personuppgifter</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>Begära radering av dina uppgifter</li>
              <li>Invända mot behandling av dina uppgifter</li>
              <li>Begära dataportabilitet</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Radering av konto</h2>
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
            <h2 className="text-2xl font-semibold">7. Kontakt</h2>
            <p className="text-foreground/80">
              Om du har frågor om denna integritetspolicy eller vill utöva dina rättigheter, 
              kontakta oss via e-post.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
