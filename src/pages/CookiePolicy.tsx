import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Cookie-policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Vad är cookies?</h2>
            <p className="text-foreground/80">
              Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. 
              De hjälper webbplatsen att komma ihåg dina inställningar och förbättra din upplevelse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Hur vi använder cookies</h2>
            <p className="text-foreground/80">HiFiHörnet använder följande typer av cookies:</p>
            
            <div className="bg-card/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Nödvändiga cookies</h3>
              <p className="text-foreground/80">
                Dessa cookies är nödvändiga för att webbplatsen ska fungera korrekt. 
                De används för att hantera din session, inloggning och ditt samtycke till cookies.
                Dessa cookies kan inte avaktiveras.
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-1 text-sm">
                <li><strong>sb-*-auth-token:</strong> Hanterar din inloggningssession</li>
                <li><strong>hifihornet_cookie_consent:</strong> Sparar ditt cookie-val</li>
              </ul>
            </div>

            <div className="bg-card/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Funktionella cookies</h3>
              <p className="text-foreground/80">
                Dessa cookies gör att webbplatsen kan komma ihåg dina val, 
                som språkinställningar och inloggningsstatus.
              </p>
            </div>

            <div className="bg-card/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Analyscookies</h3>
              <p className="text-foreground/80">
                Vi kan använda cookies för att samla in anonym information om hur besökare 
                använder vår webbplats. Detta hjälper oss att förbättra webbplatsen. 
                Ingen personlig information samlas in via dessa cookies.
              </p>
            </div>

            <div className="bg-card/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Annonscookies (Google AdSense)</h3>
              <p className="text-foreground/80">
                Om du har godkänt annonscookies använder Google AdSense cookies för att visa annonser. 
                Dessa cookies kan användas för att visa personanpassade annonser baserat på dina 
                tidigare besök på denna och andra webbplatser.
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-1 text-sm">
                <li><strong>DoubleClick:</strong> Används för att visa annonser</li>
                <li><strong>__gads:</strong> Mäter annonsinteraktioner</li>
                <li><strong>__gpi:</strong> Lagrar annonspreferenser</li>
              </ul>
              <p className="text-foreground/80 text-sm mt-2">
                Du kan när som helst välja bort personanpassade annonser. Se avsnittet "Hantera cookies" nedan.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Ditt samtycke</h2>
            <p className="text-foreground/80">
              När du besöker HiFiHörnet för första gången visas en banner där du kan välja att acceptera 
              alla cookies eller endast nödvändiga cookies. Ditt val sparas och du kan ändra det när som helst.
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Acceptera alla:</strong> Aktiverar alla cookies inklusive annonscookies</li>
              <li><strong>Endast nödvändiga:</strong> Endast cookies som krävs för att webbplatsen ska fungera</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Hantera cookies</h2>
            <p className="text-foreground/80">
              Du kan hantera eller inaktivera cookies genom din webbläsares inställningar. 
              Observera att om du inaktiverar vissa cookies kan det påverka webbplatsens funktionalitet.
            </p>
            <p className="text-foreground/80">
              <strong>Ändra ditt cookie-val:</strong> För att ändra ditt samtycke, rensa webbplatsens 
              data i din webbläsare så visas cookie-bannern igen vid nästa besök.
            </p>
            <p className="text-foreground/80">
              För att välja bort personanpassade annonser från Google, besök{" "}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Googles annonsinställningar
              </a>
              {" "}eller{" "}
              <a 
                href="https://optout.aboutads.info" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Digital Advertising Alliance
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Lagringstid</h2>
            <p className="text-foreground/80">
              Cookies lagras under olika perioder beroende på typ:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li><strong>Sessionscookies:</strong> Raderas när du stänger webbläsaren</li>
              <li><strong>Beständiga cookies:</strong> Lagras tills de löper ut eller du raderar dem</li>
              <li><strong>Cookie-samtycke:</strong> Lagras i 1 år</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Kontakt</h2>
            <p className="text-foreground/80">
              Om du har frågor om vår användning av cookies, använd vår supportchatt 
              som du hittar nere till höger på sidan.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
