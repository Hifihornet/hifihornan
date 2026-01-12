import marantz2270 from "@/assets/marantz-2270.jpg";
import technicsSL1200 from "@/assets/technics-sl1200.jpg";
import jblL100 from "@/assets/jbl-l100.jpg";
import nad3020 from "@/assets/nad-3020.jpg";
import sonyTCK777 from "@/assets/sony-tck777.jpg";
import mcintoshMC275 from "@/assets/mcintosh-mc275.jpg";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  brand: string;
  year?: string;
  location: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  images: string[];
  createdAt: string;
  viewCount?: number;
}

export const categories = [
  { id: "amplifiers", label: "Förstärkare", icon: "🔊" },
  { id: "speakers", label: "Högtalare", icon: "🔈" },
  { id: "turntables", label: "Skivspelare", icon: "💿" },
  { id: "receivers", label: "Receivers", icon: "📻" },
  { id: "cassette", label: "Kassettdäck", icon: "📼" },
  { id: "cd-players", label: "CD-spelare", icon: "💽" },
  { id: "accessories", label: "Tillbehör", icon: "🎚️" },
  { id: "other", label: "Övrigt", icon: "📦" },
];

export const conditions = [
  { id: "mint", label: "Nyskick" },
  { id: "excellent", label: "Utmärkt" },
  { id: "good", label: "Bra" },
  { id: "fair", label: "Acceptabelt" },
  { id: "parts", label: "Reservdelar" },
];

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Marantz 2270 Stereo Receiver",
    description: "Klassisk Marantz 2270 från 1972 i fantastiskt skick. Nyligen renoverad med nya kondensatorer. Levererar 70W per kanal. Den karakteristiska blå bakgrundsbelysningen lyser perfekt. Ett måste för den seriösa samlaren.",
    price: 18500,
    category: "receivers",
    condition: "excellent",
    brand: "Marantz",
    year: "1972",
    location: "Stockholm",
    sellerName: "Anders",
    sellerEmail: "anders@example.com",
    sellerPhone: "070-123 45 67",
    images: [marantz2270],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Technics SL-1200MK2 Skivspelare",
    description: "Den legendariska Technics SL-1200MK2 i silver. Perfekt för DJ:ing eller hemmalyssning. Stroboskopet fungerar felfritt, pitch-kontrollen är kalibrerad. Inkluderar original Technics headshell.",
    price: 8900,
    category: "turntables",
    condition: "good",
    brand: "Technics",
    year: "1985",
    location: "Göteborg",
    sellerName: "Maria",
    sellerEmail: "maria@example.com",
    images: [technicsSL1200],
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "JBL L100 Century Högtalare Par",
    description: "Ikoniska JBL L100 Century högtalare med original kvadratiska skumgaller. Dessa har den karakteristiska orangea färgen. Elementens upphängningar är i gott skick. Fantastiskt ljud för jazz och rock.",
    price: 25000,
    category: "speakers",
    condition: "good",
    brand: "JBL",
    year: "1975",
    location: "Malmö",
    sellerName: "Erik",
    sellerEmail: "erik@example.com",
    sellerPhone: "073-987 65 43",
    images: [jblL100],
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "NAD 3020 Integrerad Förstärkare",
    description: "Den klassiska NAD 3020 som revolutionerade budget hi-fi. Trots sin låga effekt på pappret driver den de flesta högtalare med auktoritet. Perfekt för en minimalistisk setup.",
    price: 2500,
    category: "amplifiers",
    condition: "excellent",
    brand: "NAD",
    year: "1979",
    location: "Uppsala",
    sellerName: "Lisa",
    sellerEmail: "lisa@example.com",
    images: [nad3020],
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "Sony TC-K777 Kassettdäck",
    description: "Sonys flaggskepp kassettdäck från tidigt 80-tal. Tre huvuden för simultanlyssning vid inspelning. Dolby B, C och dbx brusreducering. Mekanismen nyligen servad.",
    price: 4500,
    category: "cassette",
    condition: "excellent",
    brand: "Sony",
    year: "1982",
    location: "Linköping",
    sellerName: "Johan",
    sellerEmail: "johan@example.com",
    images: [sonyTCK777],
    createdAt: "2024-01-11",
  },
  {
    id: "6",
    title: "McIntosh MC275 Rörförstärkare",
    description: "Legendarisk McIntosh MC275 Mark V rörförstärkare. 75W per kanal från KT88-rör. Det ikoniska gröna VU-metarna och det klassiska chassit. Minimalt använd, i princip som ny.",
    price: 65000,
    category: "amplifiers",
    condition: "mint",
    brand: "McIntosh",
    year: "2018",
    location: "Stockholm",
    sellerName: "Peter",
    sellerEmail: "peter@example.com",
    sellerPhone: "076-111 22 33",
    images: [mcintoshMC275],
    createdAt: "2024-01-10",
  },
];
