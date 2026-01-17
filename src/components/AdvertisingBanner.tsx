import { useState, useEffect } from "react";
import { X, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdBannerProps {
  slot?: "top" | "sidebar" | "bottom";
  size?: "small" | "medium" | "large";
  dismissible?: boolean;
}

const AdBanner = ({ slot = "top", size = "medium", dismissible = true }: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    // Mock ads - would come from ad server
    const mockAds = {
      top: {
        title: "Premium HiFi Cables",
        description: "20% rabatt på alla kablar denna vecka",
        image: "/api/placeholder/728x90",
        link: "#",
        sponsor: "AudioPro Sweden"
      },
      sidebar: {
        title: "HiFi Legend Status",
        description: "Bli premium medlem idag",
        image: "/api/placeholder/300x250",
        link: "#",
        sponsor: "HiFiHörnet"
      },
      bottom: {
        title: "Testa Nytt Ljud",
        description: "Gratis hemma-test av hörlurar",
        image: "/api/placeholder/728x90",
        link: "#",
        sponsor: "SoundExperience"
      }
    };

    setAd(mockAds[slot]);
  }, [slot]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Track dismissal for analytics
    console.log(`Ad dismissed: ${slot}`);
  };

  const handleClick = () => {
    // Track click for analytics
    console.log(`Ad clicked: ${ad?.title}`);
    if (ad?.link) {
      window.open(ad.link, '_blank');
    }
  };

  if (!isVisible || !ad) return null;

  const sizes = {
    small: "h-16",
    medium: "h-24",
    large: "h-32"
  };

  return (
    <div className={`relative ${sizes[size]} bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10`}>
      {/* Ad content */}
      <div className="flex items-center h-full p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">Sponsrad</Badge>
            <span className="text-xs text-muted-foreground">{ad.sponsor}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">{ad.title}</h3>
          <p className="text-xs text-muted-foreground">{ad.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleClick}>
            <ExternalLink className="w-3 h-3 mr-1" />
            Mer info
          </Button>
        </div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Info badge */}
      <div className="absolute top-2 left-2">
        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
          <Info className="w-3 h-3 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
