import { TrendingUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  // AI-textanalys för att extrahera mer information från titel
  const analyzeText = (text: string): TextAnalysis => {
    const analysis = {
      powerKeywords: ['watt', 'w', 'wattage', 'rms', 'pm', 'per channel', 'x', '2x'],
      vintageKeywords: ['vintage', 'classic', 'retro', '70s', '80s', '90s', '1970', '1980', '1990'],
      conditionKeywords: ['mint', 'ny', 'som ny', 'excellent', 'perfekt', 'bra', 'fin', 'ok', 'dålig', 'reparerad'],
      features: ['tube', 'rör', 'valve', 'phono', 'mm', 'moving coil', 'electrostatic'],
      sizeKeywords: ['mini', 'compact', 'full-size', 'tower', 'bookshelf', 'floorstanding']
    };
    
    const extracted: TextAnalysis = {
      power: 0,
      isVintage: false,
      condition: null,
      features: [],
      size: null
    };
    
    // Extrahra effekt
    const powerMatch = text.match(/(\d+)\s*(w|watt|wattage|rms|pm|per channel|x)/i);
    if (powerMatch) extracted.power = parseInt(powerMatch[1]);
    
    // Extrahera vintage
    extracted.isVintage = analysis.vintageKeywords.some(keyword => text.toLowerCase().includes(keyword));
    
    // Extrahera condition
    for (const condition of analysis.conditionKeywords) {
      if (text.toLowerCase().includes(condition)) {
        extracted.condition = condition;
        break;
      }
    }
    
    // Extrahera features
    for (const feature of analysis.features) {
      if (text.toLowerCase().includes(feature)) {
        extracted.features.push(feature);
      }
    }
    
    // Extrahera storlek
    for (const size of analysis.sizeKeywords) {
      if (text.toLowerCase().includes(size)) {
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
      // Justera baspris baserat på effekt
      if (textAnalysis.power <= 10) basePrice *= 0.8; // Låg effekt
      else if (textAnalysis.power <= 50) basePrice *= 1.0; // Standard effekt
      else if (textAnalysis.power <= 100) basePrice *= 1.3; // Hög effekt
      else basePrice *= 1.6; // Mycket hög effekt
    }
    
    if (textAnalysis.isVintage) {
      basePrice *= 1.2; // Vintage premium
    }
    
    if (textAnalysis.features.includes('tube') || textAnalysis.features.includes('rör')) {
      basePrice *= 1.25; // Tube/rör premium
    }
    
    if (textAnalysis.size === 'tower' || textAnalysis.size === 'floorstanding') {
      basePrice *= 1.15; // Stora högtalare
    }
    
    // Kategori-baserad justering (uppdaterad för moderna kategorier)
    if (category === "förstärkare") basePrice = 15000;
    else if (category === "högtalare") basePrice = 8000;
    else if (category === "spelare") basePrice = 3000;
    else if (category === "mottagare") basePrice = 12000;
    else if (category === "förstärkare/rör") basePrice = 20000;
    else if (category === "multiroom") basePrice = 4000; // Streaming-enheter
    else if (category === "cd-players") basePrice = 2500;
    else if (category === "cassette") basePrice = 2000;
    else if (category === "accessories") basePrice = 1500;
    
    // Märke-premium (utökad med moderna märken)
    const premiumBrands = ["McIntosh", "Marantz", "Rega", "Naim", "Linn", "Sonus", "Audio Research", "Krell", "Sonos", "Bluesound", "Bose", "B&W", "Dynaudio", "KEF", "Q Acoustics"];
    const streamingBrands = ["Sonos", "Bluesound", "Heos", "Chromecast", "AirPlay"];
    const hifiKlubbenBrands = ["McIntosh", "Marantz", "Rega", "Naim", "Linn", "Audio Research", "Krell", "Sonus", "B&W", "Dynaudio", "KEF", "Q Acoustics", "Pro-Ject", "Clearaudio", "Musical Fidelity", "Rotel", "Cambridge Audio"];
    
    // Märke-premium för premium HiFi-märken
    if (brand && premiumBrands.some(premium => brand.toLowerCase().includes(premium.toLowerCase()))) {
      basePrice *= 1.3;
    }
    
    // Streaming-enheter har högre värde på begagnatmarknaden
    if (brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()))) {
      basePrice *= 1.2;
    }
    
    // HiFiKlubben.se premium för high-end HiFi-märken
    if (brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase()))) {
      basePrice *= 1.15; // Lite lägre premium än generisk premium
    }
    
    // Ålder-faktor (streaming-enheter håller värde bättre)
    if (year) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      
      // Streaming-enheter håller värde bättre än traditionell HiFi
      const isStreamingDevice = brand && streamingBrands.some(streaming => brand.toLowerCase().includes(streaming.toLowerCase()));
      const isHighEnd = brand && hifiKlubbenBrands.some(hifi => brand.toLowerCase().includes(hifi.toLowerCase()));
      
      if (isStreamingDevice) {
        if (age <= 1) basePrice *= 0.90; // 90% av nypris (ökat från 85%)
        else if (age <= 3) basePrice *= 0.80; // 80% av nypris (ökat från 75%)
        else if (age <= 5) basePrice *= 0.70; // 70% av nypris (ökat från 65%)
        else if (age <= 8) basePrice *= 0.55; // 55% av nypris (ökat från 50%)
        else basePrice *= 0.40; // 40% av nypris (ökat från 35%)
      } else if (isHighEnd) {
        // High-end HiFi håller värde exceptionellt bra
        if (age <= 2) basePrice *= 0.80; // 80% av nypris (ökat från 75%)
        else if (age <= 5) basePrice *= 0.70; // 70% av nypris (ökat från 65%)
        else if (age <= 10) basePrice *= 0.55; // 55% av nypris (ökat från 50%)
        else if (age <= 20) basePrice *= 0.40; // 40% av nypris (ökat från 35%)
        else basePrice *= 0.30; // 30% av nypris (ökat från 25%)
      } else {
        // Traditionell HiFi
        if (age <= 2) basePrice *= 0.85; // 85% av nypris (ökat från 80%)
        else if (age <= 5) basePrice *= 0.70; // 70% av nypris (ökat från 60%)
        else if (age <= 10) basePrice *= 0.50; // 50% av nypris (ökat från 40%)
        else basePrice *= 0.30; // 30% av nypris (ökat från 20%)
      }
    }
    
    // Condition-faktor (använd AI-textanalys om tillgänglig)
    let conditionMultiplier = 0.8; // Standard för "good"
    if (condition === "mint") conditionMultiplier = 0.95; // Nyskick (ökat från 0.9)
    else if (condition === "excellent") conditionMultiplier = 0.85; // Utmärkt (ökat från 0.8)
    else if (condition === "good") conditionMultiplier = 0.70; // Bra (ökat från 0.6)
    else if (condition === "fair") conditionMultiplier = 0.50; // Acceptabelt (ökat från 0.4)
    else if (condition === "parts") conditionMultiplier = 0.35; // Behov av service (ökat från 0.3)
    else if (condition === "poor") conditionMultiplier = 0.25; // Dåligt (ökat från 0.2)
    else if (textAnalysis.condition) {
      // Använd AI-detekterat skick
      if (textAnalysis.condition === 'mint') conditionMultiplier = 0.95; // Ökat
      else if (textAnalysis.condition === 'ny') conditionMultiplier = 0.98; // Ökat
      else if (textAnalysis.condition === 'excellent') conditionMultiplier = 0.90; // Ökat
      else if (textAnalysis.condition === 'perfekt') conditionMultiplier = 0.90; // Ökat
      else if (textAnalysis.condition === 'fin') conditionMultiplier = 0.75; // Ökat
      else if (textAnalysis.condition === 'bra') conditionMultiplier = 0.70; // Ökat
      else if (textAnalysis.condition === 'ok') conditionMultiplier = 0.55; // Ökat
      else if (textAnalysis.condition === 'dålig') conditionMultiplier = 0.40; // Ökat
      else if (textAnalysis.condition === 'reparerad') conditionMultiplier = 0.35; // Ökat
      else if (textAnalysis.condition === 'dåligt') conditionMultiplier = 0.25; // Ökat
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
    if (textAnalysis.features.length > 0) {
      reasoning += `, ${textAnalysis.features.join(", ")}`;
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
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Prisförslag</h3>
        </div>
        <Badge 
          className={`${getConfidenceColor(priceRange.confidence)} text-white`}
        >
          {priceRange.confidence}% säkerhet
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rekommenderat pris:</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(priceRange.recommended)} kr
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Prisintervall:</span>
          <span className="text-foreground">
            {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)} kr
          </span>
        </div>
      </div>
      
      <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {priceRange.reasoning}. Priserna baseras på svenska HiFi-marknadspriser och kan variera beroende på unika egenskaper.
        </p>
      </div>
    </div>
  );
};

export default PriceSuggestion;
