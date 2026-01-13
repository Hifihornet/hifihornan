import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cookie, Shield, BarChart, Megaphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const CONSENT_KEY = "hifihornet_cookie_consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp?: string;
}

const CookieSettings = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    advertising: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({
          necessary: true, // Always true
          analytics: parsed.analytics ?? false,
          advertising: parsed.advertising ?? false,
        });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString(),
    }));
    setSaved(true);
    toast.success("Dina cookie-inställningar har sparats!");
    
    // Reset saved state after animation
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      advertising: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...allAccepted,
      timestamp: new Date().toISOString(),
    }));
    toast.success("Alla cookies har godkänts!");
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      advertising: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...onlyNecessary,
      timestamp: new Date().toISOString(),
    }));
    toast.success("Endast nödvändiga cookies är nu aktiva.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Cookie-inställningar</h1>
            <p className="text-muted-foreground">
              Hantera hur vi använder cookies på HiFiHörnet
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAcceptAll} className="flex-1">
              Acceptera alla
            </Button>
            <Button onClick={handleRejectOptional} variant="outline" className="flex-1">
              Endast nödvändiga
            </Button>
          </div>

          {/* Cookie categories */}
          <div className="space-y-4">
            {/* Necessary cookies */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="necessary" className="text-base font-semibold cursor-pointer">
                      Nödvändiga cookies
                    </Label>
                    <Switch
                      id="necessary"
                      checked={true}
                      disabled
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dessa cookies är nödvändiga för att webbplatsen ska fungera korrekt. 
                    De används för inloggning, session och ditt cookie-samtycke. 
                    Dessa kan inte avaktiveras.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">sb-*-auth-token</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">hifihornet_cookie_consent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics cookies */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <BarChart className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                      Analyscookies
                    </Label>
                    <Switch
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hjälper oss förstå hur besökare använder webbplatsen. 
                    All data är anonym och används endast för att förbättra upplevelsen.
                  </p>
                </div>
              </div>
            </div>

            {/* Advertising cookies */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <Megaphone className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="advertising" className="text-base font-semibold cursor-pointer">
                      Annonscookies
                    </Label>
                    <Switch
                      id="advertising"
                      checked={preferences.advertising}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, advertising: checked }))
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Används av Google AdSense för att visa relevanta annonser. 
                    Du kan välja bort dessa om du föredrar icke-personanpassade annonser.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">DoubleClick</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">__gads</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">__gpi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <Button 
            onClick={handleSave} 
            className="w-full" 
            size="lg"
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Sparat!
              </>
            ) : (
              "Spara inställningar"
            )}
          </Button>

          {/* Additional info */}
          <p className="text-xs text-muted-foreground text-center">
            Läs mer om hur vi hanterar cookies i vår{" "}
            <a href="/cookies" className="text-primary hover:underline">
              cookie-policy
            </a>
            {" "}och{" "}
            <a href="/integritetspolicy" className="text-primary hover:underline">
              integritetspolicy
            </a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookieSettings;
