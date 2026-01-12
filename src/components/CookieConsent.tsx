import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CONSENT_KEY = "hifihornan_cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      necessary: true, 
      analytics: true, 
      advertising: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      necessary: true, 
      analytics: false, 
      advertising: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 relative">
          <button 
            onClick={handleAcceptNecessary}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Stäng"
          >
            <X size={20} />
          </button>
          
          <div className="pr-8">
            <h3 className="font-semibold text-lg mb-2">Vi använder cookies 🍪</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Hifihörnan använder cookies för att förbättra din upplevelse och visa relevanta annonser. 
              Vi använder Google AdSense som kan samla in data för personanpassade annonser.
              Läs mer i vår{" "}
              <Link to="/cookies" className="text-primary hover:underline">
                cookie-policy
              </Link>
              {" "}och{" "}
              <Link to="/integritetspolicy" className="text-primary hover:underline">
                integritetspolicy
              </Link>.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAcceptAll} className="flex-1 sm:flex-none">
                Acceptera alla
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAcceptNecessary}
                className="flex-1 sm:flex-none"
              >
                Endast nödvändiga
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
