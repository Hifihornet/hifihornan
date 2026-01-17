import { TrendingUp, Info, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PriceSuggestionProps {
  brand?: string;
  category?: string;
  condition?: string;
  year?: number;
  hasAmplifier?: boolean;
  hasTurntable?: boolean;
  hasTonearm?: boolean;
  isDigital?: boolean;
  title?: string;
}

interface PriceRange {
  min: number;
  max: number;
  recommended: number;
  confidence: number;
  reasoning: string;
}

interface TextAnalysis {
  power: number;
  isVintage: boolean;
  condition: string | null;
  features: string[];
  size: string | null;
}

const PriceSuggestion = ({ 
  brand, 
  category, 
  condition, 
  year, 
  hasAmplifier, 
  hasTurntable, 
  hasTonearm, 
  isDigital,
  title 
}: PriceSuggestionProps) => {
  
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  
  // Kolla om vi har tillräckligt med data för att ge ett prisförslag
  const hasData = brand || category || condition || year || title;
  
  // Visa AI-hjälpare om vi har data men användaren inte har bett om prisförslag
  const shouldShowHelper = hasData && !showPriceSuggestion;
  
  // AI-textanalys för att extrahera mer information från titel
  const analyzeText = (text: string): TextAnalysis => {
    const analysis = {
      // Effekt-nyckelord (utökade)
      powerKeywords: ['watt', 'w', 'wattage', 'rms', 'pm', 'per channel', 'x', '2x', 'wpc', 'w/channel', 'watts', 'wattar'],
      
      // Vintage-nyckelord (utökade)
      vintageKeywords: ['vintage', 'classic', 'retro', '70s', '80s', '90s', '1970', '1980', '1990', '1960', '1950', 'antique', 'old school', 'original', 'first generation'],
      
      // Condition-nyckelord (utökade)
      conditionKeywords: ['mint', 'ny', 'som ny', 'excellent', 'perfekt', 'bra', 'fin', 'ok', 'dålig', 'reparerad', 'a1', 'top condition', 'like new', 'pristine', 'flawless', 'great', 'good working', 'needs repair', 'as is', 'for parts'],
      
      // Features-nyckelord (utökade)
      features: ['tube', 'rör', 'valve', 'phono', 'mm', 'moving coil', 'electrostatic', 'balanced', 'xlr', 'digital', 'analog', 'class a', 'class ab', 'class d', 'mosfet', 'bi-amping', 'bi-wiring', 'subwoofer', 'tweeter', 'woofer', 'midrange', 'crossover', 'equalizer', 'tone control', 'loudness', 'direct', 'bypass'],
      
      // Size-nyckelord (utökade)
      sizeKeywords: ['mini', 'compact', 'full-size', 'tower', 'bookshelf', 'floorstanding', 'standmount', 'satellite', 'subwoofer', 'center channel', 'portable', 'desktop', 'rack mount'],
      
      // Nya: Material och build quality
      materialKeywords: ['solid wood', 'real wood', 'mahogany', 'oak', 'cherry', 'walnut', 'aluminum', 'brass', 'copper', 'steel', 'chrome', 'brushed', 'polished'],
      
      // Nya: Special features
      specialFeatures: ['remote', 'wireless', 'bluetooth', 'wifi', 'airplay', 'chromecast', 'spotify connect', 'roon ready', 'tidal', 'qobuz', 'dlna', 'upnp', 'multiroom', 'stereo', 'mono', 'surround', 'dolby', 'dts'],
      
      // Nya: Technical specifications
      techSpecs: ['thd', 'snr', 'frequency response', 'impedance', 'ohm', 'hz', 'khz', 'db', 'spl', 'sensitivity', 'power consumption', 'voltage', 'amperage']
    };
    
    const extracted: TextAnalysis = {
      power: 0,
      isVintage: false,
      condition: null,
      features: [],
      size: null
    };
    
    // Extrahra effekt (förbättrad regex)
    const powerPatterns = [
      /(\d+)\s*(?:w|watt|wattage|rms|pm|per\s*channel|x|wpc|w\/channel|watts|wattar)/i,
      /(\d+)\s*(?:x|per\s*channel)\s*(?:w|watt)/i,
      /(\d+)\s*w(?:\s*per\s*channel)?/i
    ];
    
    for (const pattern of powerPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.power = parseInt(match[1]);
        break;
      }
    }
    
    // Extrahera vintage (förbättrad logik)
    const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const currentYear = new Date().getFullYear();
      if (currentYear - year >= 20) {
        extracted.isVintage = true;
      }
    }
    
    extracted.isVintage = extracted.isVintage || analysis.vintageKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Extrahera condition (förbättrad prioritering)
    const conditionPriority = ['mint', 'ny', 'som ny', 'pristine', 'flawless', 'like new', 'excellent', 'perfekt', 'a1', 'top condition', 'great', 'bra', 'fin', 'good working', 'ok', 'dålig', 'needs repair', 'for parts', 'as is'];
    
    for (const condition of conditionPriority) {
      if (text.toLowerCase().includes(condition.toLowerCase())) {
        extracted.condition = condition;
        break;
      }
    }
    
    // Extrahera features (utökad)
    for (const feature of analysis.features) {
      if (text.toLowerCase().includes(feature.toLowerCase())) {
        if (!extracted.features.includes(feature)) {
          extracted.features.push(feature);
        }
      }
    }
    
    // Extrahera storlek (förbättrad)
    for (const size of analysis.sizeKeywords) {
      if (text.toLowerCase().includes(size.toLowerCase())) {
        extracted.size = size;
        break;
      }
    }
    
    return extracted;
  };
  
  const calculatePriceRange = (): PriceRange => {
    let basePrice = 5000; // Baspris för HiFi-utrustning
    
    // AI-textanalys av titel
    const textAnalysis = title ? analyzeText(title) : { power: 0, isVintage: false, condition: null, features: [], size: null };
    
    // Justera baserat på textanalys
    if (textAnalysis.power > 0) {
      // Justera baspris baserat på effekt (förbättrad skala)
      if (textAnalysis.power <= 10) basePrice *= 0.8; // Låg effekt
      else if (textAnalysis.power <= 25) basePrice *= 0.9; // Låg-mellan effekt
      else if (textAnalysis.power <= 50) basePrice *= 1.0; // Standard effekt
      else if (textAnalysis.power <= 100) basePrice *= 1.3; // Hög effekt
      else if (textAnalysis.power <= 200) basePrice *= 1.6; // Mycket hög effekt
      else basePrice *= 2.0; // Extremt hög effekt
    }
    
    if (textAnalysis.isVintage) {
      basePrice *= 1.2; // Vintage premium
    }
    
    // Utökade feature-premiums
    if (textAnalysis.features.includes('tube') || textAnalysis.features.includes('rör')) {
      basePrice *= 1.25; // Tube/rör premium
    }
    if (textAnalysis.features.includes('phono')) {
      basePrice *= 1.1; // Phono premium
    }
    if (textAnalysis.features.includes('class a')) {
      basePrice *= 1.15; // Class A premium
    }
    if (textAnalysis.features.includes('balanced') || textAnalysis.features.includes('xlr')) {
      basePrice *= 1.1; // Balanced connection premium
    }
    if (textAnalysis.features.includes('mosfet')) {
      basePrice *= 1.05; // MOSFET premium
    }
    if (textAnalysis.features.includes('electrostatic')) {
      basePrice *= 1.3; // Electrostatic premium
    }
    
    if (textAnalysis.size === 'tower' || textAnalysis.size === 'floorstanding') {
      basePrice *= 1.15; // Stora högtalare
    }
    if (textAnalysis.size === 'bookshelf' || textAnalysis.size === 'standmount') {
      basePrice *= 1.05; // Bookshelf premium
    }
    if (textAnalysis.size === 'mini' || textAnalysis.size === 'compact') {
      basePrice *= 0.9; // Mini discount
    }
    if (textAnalysis.size === 'subwoofer') {
      basePrice *= 1.1; // Subwoofer premium
    }
    
    // Kategori-baserad justering (uppdaterad för moderna kategorier) - HiFi-entusiaster vet värdet!
    if (category === "förstärkare") basePrice = 18000; // Ökat från 15000
    else if (category === "högtalare") basePrice = 10000; // Ökat från 8000
    else if (category === "spelare") basePrice = 4000; // Ökat från 3000
    else if (category === "mottagare") basePrice = 15000; // Ökat från 12000
    else if (category === "förstärkare/rör") basePrice = 25000; // Ökat från 20000
    else if (category === "multiroom") basePrice = 3500; // SÄNKT från 5000 för streaming-enheter
    else if (category === "cd-players") basePrice = 3000; // Ökat från 2500
    else if (category === "cassette") basePrice = 2500; // Ökat från 2000
    else if (category === "accessories") basePrice = 2000; // Ökat från 1500;
    
    // Märke-premium (utökad med moderna märken) - HiFi-entusiaster vet värdet!
    const premiumBrands = ["McIntosh", "Marantz", "Rega", "Naim", "Linn", "Sonus", "Audio Research", "Krell", "B&W", "Dynaudio", "KEF", "Q Acoustics"];
    const streamingBrands = ["Sonos", "Bluesound", "Heos", "Chromecast", "AirPlay"];
    const hifiKlubbenBrands = ["McIntosh", "Marantz", "Rega", "Naim", "Linn", "Audio Research", "Krell", "Sonus", "B&W", "Dynaudio", "KEF", "Q Acoustics", "Pro-Ject", "Clearaudio", "Musical Fidelity", "Rotel", "Cambridge Audio"];
    
    // Märke-premium för premium HiFi-märken - HiFi-entusiaster vet värdet!
    if (brand && premiumBrands.some(premium => brand.toLowerCase().includes(premium.toLowerCase()))) {
      basePrice *= 1.4; // Ökat från 1.3
    }
    
    // Streaming-enheter har högre värde på begagnatmarknaden - MEN INTE DUBBELT NYPRIS!
    if (brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()))) {
      // Om det är en streaming-enhet, använd lägre premium för att undvika dubbla nypriser
      if (category === "multiroom") {
        basePrice *= 1.05; // Bara 5% premium för streaming-enheter
      } else {
        basePrice *= 1.25; // Ökat från 1.2 för andra kategorier
      }
    }
    
    // HiFiKlubben.se premium för high-end HiFi-märken - HiFi-entusiaster vet värdet!
    // MEN INTE för streaming-enheter som redan har premium
    const isStreamingDevice = brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()));
    if (brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase())) && !isStreamingDevice) {
      basePrice *= 1.2; // Ökat från 1.15
    }
    
    // Ålder-faktor (streaming-enheter håller värde bättre)
    if (year) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      
      // Streaming-enheter håller värde bättre än traditionell HiFi
      const isStreamingDevice = brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()));
      const isHighEnd = brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase()));
      
      if (isStreamingDevice) {
        if (age <= 1) basePrice *= 0.95; // 95% av nypris (ökat från 90%)
        else if (age <= 3) basePrice *= 0.85; // 85% av nypris (ökat från 80%)
        else if (age <= 5) basePrice *= 0.75; // 75% av nypris (ökat från 70%)
        else if (age <= 8) basePrice *= 0.60; // 60% av nypris (ökat från 55%)
        else basePrice *= 0.45; // 45% av nypris (ökat från 40%)
      } else if (isHighEnd) {
        // High-end HiFi håller värde exceptionellt bra - HiFi-entusiaster vet värdet!
        if (age <= 2) basePrice *= 0.85; // 85% av nypris (ökat från 80%)
        else if (age <= 5) basePrice *= 0.75; // 75% av nypris (ökat från 70%)
        else if (age <= 10) basePrice *= 0.60; // 60% av nypris (ökat från 55%)
        else if (age <= 20) basePrice *= 0.45; // 45% av nypris (ökat från 40%)
        else basePrice *= 0.35; // 35% av nypris (ökat från 30%)
      } else {
        // Traditionell HiFi - höjt för HiFi-kännare
        if (age <= 2) basePrice *= 0.90; // 90% av nypris (ökat från 85%)
        else if (age <= 5) basePrice *= 0.75; // 75% av nypris (ökat från 70%)
        else if (age <= 10) basePrice *= 0.55; // 55% av nypris (ökat från 50%)
        else basePrice *= 0.35; // 35% av nypris (ökat från 30%)
      }
    }
    
    // Condition-faktor (använd AI-textanalys om tillgänglig) - HiFi-entusiaster vet värdet!
    let conditionMultiplier = 0.8; // Standard för "good"
    if (condition === "mint") conditionMultiplier = 0.98; // Nyskick (ökat från 0.95)
    else if (condition === "excellent") conditionMultiplier = 0.90; // Utmärkt (ökat från 0.85)
    else if (condition === "good") conditionMultiplier = 0.75; // Bra (ökat från 0.70)
    else if (condition === "fair") conditionMultiplier = 0.55; // Acceptabelt (ökat från 0.50)
    else if (condition === "parts") conditionMultiplier = 0.40; // Behov av service (ökat från 0.35)
    else if (condition === "poor") conditionMultiplier = 0.30; // Dåligt (ökat från 0.25)
    else if (textAnalysis.condition) {
      // Använd AI-detekterat skick - HiFi-entusiaster vet värdet!
      if (textAnalysis.condition === 'mint') conditionMultiplier = 0.98; // Ökat
      else if (textAnalysis.condition === 'ny') conditionMultiplier = 0.99; // Ökat
      else if (textAnalysis.condition === 'excellent') conditionMultiplier = 0.92; // Ökat
      else if (textAnalysis.condition === 'perfekt') conditionMultiplier = 0.92; // Ökat
      else if (textAnalysis.condition === 'fin') conditionMultiplier = 0.80; // Ökat
      else if (textAnalysis.condition === 'bra') conditionMultiplier = 0.75; // Ökat
      else if (textAnalysis.condition === 'ok') conditionMultiplier = 0.60; // Ökat
      else if (textAnalysis.condition === 'dålig') conditionMultiplier = 0.45; // Ökat
      else if (textAnalysis.condition === 'reparerad') conditionMultiplier = 0.40; // Ökat
      else if (textAnalysis.condition === 'dåligt') conditionMultiplier = 0.30; // Ökat
    }
    
    basePrice *= conditionMultiplier;
    
    // Komponent-tillägg
    if (hasAmplifier) basePrice *= 1.3;
    if (hasTurntable) basePrice *= 1.2;
    if (hasTonearm) basePrice *= 1.15;
    if (isDigital) basePrice *= 0.9; // Analog har premium
    
    // Beräkna prisintervall
    const variance = basePrice * 0.3; // ±30% variation
    const minPrice = Math.round(basePrice - variance);
    const maxPrice = Math.round(basePrice + variance);
    const recommended = Math.round(basePrice);
    
    // Confidence baserat på hur mycket data vi har
    let confidence = 70; // Grundläggande confidence
    if (brand && condition && year) confidence = 85;
    if (brand && condition && year && (hasAmplifier || hasTurntable)) confidence = 90;
    if (title && title.length > 10) confidence += 5; // AI-textanalys ökar confidence
    
    // Reasoning
    let reasoning = "Baserat på svensk HiFi-marknad (Blocket, HiFiKlubben.se)";
    if (brand && premiumBrands.some(premium => brand.toLowerCase().includes(premium.toLowerCase()))) {
      reasoning += ", premium märke";
    }
    if (brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase()))) {
      reasoning += ", HiFiKlubben premium";
    }
    if (brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()))) {
      reasoning += ", streaming-enheter";
    }
    if (year) {
      reasoning += `, ${new Date().getFullYear() - year} år gammalt`;
    }
    if (textAnalysis.power > 0) {
      reasoning += `, ${textAnalysis.power}W`;
    }
    if (textAnalysis.isVintage) {
      reasoning += ", vintage";
    }
    
    // Visa alla upptäckta features
    if (textAnalysis.features.length > 0) {
      const featureNames = {
        'tube': 'rör',
        'rör': 'rör',
        'valve': 'rör',
        'phono': 'phono',
        'mm': 'MM',
        'moving coil': 'MC',
        'electrostatic': 'electrostatic',
        'balanced': 'balanced',
        'xlr': 'XLR',
        'digital': 'digital',
        'analog': 'analog',
        'class a': 'Class A',
        'class ab': 'Class AB',
        'class d': 'Class D',
        'mosfet': 'MOSFET',
        'bi-amping': 'bi-amping',
        'bi-wiring': 'bi-wiring',
        'subwoofer': 'subwoofer',
        'tweeter': 'tweeter',
        'woofer': 'woofer',
        'midrange': 'midrange',
        'crossover': 'crossover',
        'equalizer': 'equalizer',
        'tone control': 'tone control',
        'loudness': 'loudness',
        'direct': 'direct',
        'bypass': 'bypass'
      };
      
      const translatedFeatures = textAnalysis.features.map(f => featureNames[f] || f);
      reasoning += `, ${translatedFeatures.join(", ")}`;
    }
    
    if (textAnalysis.size) {
      const sizeNames = {
        'tower': 'tower',
        'floorstanding': 'floorstanding',
        'bookshelf': 'bookshelf',
        'standmount': 'standmount',
        'mini': 'mini',
        'compact': 'compact',
        'subwoofer': 'subwoofer',
        'satellite': 'satellite',
        'center channel': 'center channel',
        'portable': 'portable',
        'desktop': 'desktop',
        'rack mount': 'rack mount'
      };
      reasoning += `, ${sizeNames[textAnalysis.size] || textAnalysis.size}`;
    }
    
    if (hasAmplifier || hasTurntable || hasTonearm) {
      const components = [];
      if (hasAmplifier) components.push("förstärkare");
      if (hasTurntable) components.push("spelare");
      if (hasTonearm) components.push("tonarm");
      reasoning += `, med ${components.join(", ")}`;
    }
    
    // Lägg till information om high-end vs standard
    if (brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase()))) {
      reasoning += " (high-end HiFi håller värde bättre)";
    }
    
    if (title && title.length > 10) {
      reasoning += " (AI-analys av titel)";
    }
    
    // Lägg till confidence-boosters
    if (textAnalysis.power > 0 && textAnalysis.features.length > 0) {
      reasoning += " (detaljerad spec-analys)";
    }
    if (textAnalysis.isVintage && year) {
      reasoning += " (verifierad vintage)";
    }
    
    return {
      min: Math.max(minPrice, 500),
      max: maxPrice,
      recommended,
      confidence,
      reasoning
    };
  };

  const priceRange = calculatePriceRange();
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "bg-green-500";
    if (confidence >= 75) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE').format(price);
  };

  return (
    <div className="space-y-4">
      {/* AI-hjälpare */}
      {shouldShowHelper && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                  AI Prisbedömning tillgänglig!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Jag har analyserat din information och kan ge dig ett prisförslag baserat på svensk HiFi-marknad.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => setShowPriceSuggestion(true)}
                  size="sm" 
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Visa AI-prisförslag
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPriceSuggestion(false)}
                  className="w-full sm:w-auto"
                >
                  Nej tack
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Prisförslag */}
      {showPriceSuggestion && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">AI Prisförslag</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${getConfidenceColor(priceRange.confidence)} text-white text-xs sm:text-sm`}
              >
                {priceRange.confidence}% säkerhet
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPriceSuggestion(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Rekommenderat pris:</span>
              <span className="text-xl sm:text-2xl font-bold text-primary text-center sm:text-right">
                {formatPrice(priceRange.recommended)} kr
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Prisintervall:</span>
              <span className="text-foreground text-center sm:text-right">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)} kr
              </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {priceRange.reasoning}. Priserna baseras på svenska HiFi-marknadspriser och kan variera beroende på unika egenskaper.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceSuggestion;
