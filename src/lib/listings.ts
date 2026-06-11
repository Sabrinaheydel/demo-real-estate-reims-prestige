import annonce1Asset from "@/assets/annonce-1-appartement-haussmannien.png.asset.json";
import annonce2Asset from "@/assets/annonce-2-maison-familiale.png.asset.json";
import annonce3Asset from "@/assets/annonce-3-deux-pieces-traversant.png.asset.json";
import annonce4Asset from "@/assets/annonce-4-villa-contemporaine.png.asset.json";
import annonce5Asset from "@/assets/annonce-5-studio-renove.png.asset.json";
import annonce6Asset from "@/assets/annonce-6-maison-de-caractere.png.asset.json";
import annonce7Asset from "@/assets/annonce-7-appartement-t4-standing.png.asset.json";

export type ListingStatus = "vente" | "location" | "exclusivite";

export type Listing = {
  id: string;
  status: ListingStatus[];
  price: number;
  priceLabel: string;
  isRental: boolean;
  title: string;
  surface: number;
  rooms: number | null;
  bedrooms: number | null;
  parking: boolean;
  features: string[];
  neighborhood: string;
  description: string;
  photos: string[];
};

export const LISTINGS: Listing[] = [
  {
    id: "1",
    status: ["vente", "exclusivite"],
    price: 289000,
    priceLabel: "289 000 €",
    isRental: false,
    title: "Appartement haussmannien rénové Centre historique",
    surface: 94,
    rooms: 4,
    bedrooms: 3,
    parking: false,
    features: ["Cave", "Ascenseur", "Parquet ancien"],
    neighborhood: "Centre-ville. Rue Cérès",
    description:
      "Magnifique appartement haussmannien entièrement rénové avec goût. Hauts plafonds, parquet ancien, moulures d'époque. Séjour double lumineux, cuisine équipée ouverte, 3 chambres dont une suite parentale. Immeuble pierre de taille, ascenseur, cave. Un bien rare dans le secteur le plus recherché de Reims.",
    photos: [annonce1Asset.url],
  },
  {
    id: "2",
    status: ["vente"],
    price: 347000,
    priceLabel: "347 000 €",
    isRental: false,
    title: "Maison familiale avec jardin. Secteur Clairmarais",
    surface: 138,
    rooms: 6,
    bedrooms: 4,
    parking: true,
    features: ["Jardin 280 m²", "Garage double", "Cheminée"],
    neighborhood: "Clairmarais",
    description:
      "Belle maison de ville années 30 pleine de caractère. Séjour avec cheminée, salle à manger, cuisine indépendante. 4 chambres à l'étage, salle de bain et salle d'eau. Jardin arboré exposé sud, garage double. Secteur calme prisé des familles, à 10 min à pied de la cathédrale.",
    photos: [annonce2Asset.url],
  },
  {
    id: "3",
    status: ["location"],
    price: 780,
    priceLabel: "780 €/mois",
    isRental: true,
    title: "Studio design proche CHU. Idéal étudiant/jeune actif",
    surface: 32,
    rooms: 1,
    bedrooms: null,
    parking: false,
    features: ["Meublé", "Fibre incluse", "Digicode"],
    neighborhood: "Jean Jaurès. Proximité CHU",
    description:
      "Studio entièrement meublé et équipé, refait à neuf. Coin nuit séparé, cuisine équipée, salle d'eau moderne. Internet fibre inclus. Immeuble sécurisé avec digicode. Idéalement situé à 5 min à pied du CHU et des transports.",
    photos: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1600",
    ],
  },
  {
    id: "4",
    status: ["vente"],
    price: 165000,
    priceLabel: "165 000 €",
    isRental: false,
    title: "2 pièces traversant. Investissement locatif idéal",
    surface: 48,
    rooms: 2,
    bedrooms: 1,
    parking: false,
    features: ["Cave", "Traversant", "Charges faibles"],
    neighborhood: "Boulevard Lundy",
    description:
      "Appartement traversant lumineux, parfait pour investissement ou premier achat. Séjour avec coin repas, chambre séparée, cuisine équipée, salle de bain. Charges faibles. Rendement locatif estimé : 5,2% brut. Locataire en place possible.",
    photos: [annonce3Asset.url],
  },
  {
    id: "5",
    status: ["vente", "exclusivite"],
    price: 520000,
    priceLabel: "520 000 €",
    isRental: false,
    title: "Villa contemporaine avec piscine. Reims Sud",
    surface: 220,
    rooms: 7,
    bedrooms: 5,
    parking: true,
    features: ["Piscine chauffée", "Terrain 800 m²", "Double garage"],
    neighborhood: "Bezannes. Reims Sud",
    description:
      "Exceptionnelle villa contemporaine construite en 2018. Grandes baies vitrées, séjour cathédrale de 60 m², cuisine américaine haut de gamme, 5 chambres dont suite parentale avec dressing et salle de bain privative. Piscine chauffée, terrain paysager, double garage. Quartier résidentiel calme.",
    photos: [annonce4Asset.url],
  },
  {
    id: "6",
    status: ["location"],
    price: 1150,
    priceLabel: "1 150 €/mois",
    isRental: true,
    title: "Appartement T3 lumineux. Quartier des Sacres",
    surface: 72,
    rooms: 3,
    bedrooms: 2,
    parking: true,
    features: ["Balcon sud", "Parking privatif", "Récent"],
    neighborhood: "Quartier des Sacres",
    description:
      "Grand T3 refait à neuf dans immeuble récent. Double séjour lumineux, cuisine ouverte équipée, 2 belles chambres, salle de bain et WC séparés. Balcon orienté sud, parking privatif. Proche commerces, écoles et transports. Disponible immédiatement.",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600",
    ],
  },
  {
    id: "7",
    status: ["vente"],
    price: 98000,
    priceLabel: "98 000 €",
    isRental: false,
    title: "Studio rénové. Idéal premier investissement",
    surface: 28,
    rooms: 1,
    bedrooms: null,
    parking: false,
    features: ["Digicode", "Interphone", "Double vitrage"],
    neighborhood: "Hypercentre. Rue de Vesle",
    description:
      "Studio entièrement rénové au cœur de Reims. Cuisine équipée, salle d'eau refaite, double vitrage. Immeuble Pierre de taille, digicode. Rentabilité brute : 6,1%. Secteur ultra-demandé, vacance locative quasi nulle.",
    photos: [annonce5Asset.url],
  },
  {
    id: "8",
    status: ["vente"],
    price: 412000,
    priceLabel: "412 000 €",
    isRental: false,
    title: "Maison de caractère avec dépendance. Village proche Reims",
    surface: 185,
    rooms: 7,
    bedrooms: 4,
    parking: true,
    features: ["Dépendance 60 m²", "Terrain 1200 m²", "Cheminée marbre"],
    neighborhood: "Cormontreuil. 8 min de Reims",
    description:
      "Superbe maison de caractère en pierre avec dépendance aménageable. Grandes pièces de réception, cheminée en marbre, cuisine rénovée, 4 chambres. Dépendance de 60 m² idéale pour télétravail ou chambre d'hôtes. Grand terrain arboré. Rare.",
    photos: [annonce6Asset.url],
  },
  {
    id: "9",
    status: ["location"],
    price: 490,
    priceLabel: "490 €/mois",
    isRental: true,
    title: "T2 calme et lumineux. Résidence sécurisée",
    surface: 44,
    rooms: 2,
    bedrooms: 1,
    parking: true,
    features: ["Parking", "Cave", "Gardien"],
    neighborhood: "Avenue de Laon",
    description:
      "Beau T2 dans résidence sécurisée avec gardien. Séjour lumineux, chambre séparée, cuisine équipée, salle de bain refaite. Parking et cave inclus dans le loyer. Environnement calme et verdoyant, tous commerces à pied.",
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600",
    ],
  },
  {
    id: "10",
    status: ["vente"],
    price: 236000,
    priceLabel: "236 000 €",
    isRental: false,
    title: "Appartement T4 familial. Résidence de standing",
    surface: 89,
    rooms: 4,
    bedrooms: 3,
    parking: true,
    features: ["Parking souterrain", "Gardien", "Cave"],
    neighborhood: "Laon. Clairmarais",
    description:
      "Spacieux T4 dans résidence gardiennée de standing. Grand séjour double, 3 chambres, cuisine équipée, deux salles d'eau. Parking souterrain, cave. Charges raisonnables. Idéal famille ou investissement patrimonial.",
    photos: [annonce7Asset.url],
  },
];

export const NEIGHBORHOODS = Array.from(
  new Set(LISTINGS.map((l) => l.neighborhood.split(". ")[0].trim()))
).sort();

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getListingReference(id: string): string {
  return `DI-2024-${id.padStart(3, "0")}`;
}

const DPE_BY_ID: Record<string, "A" | "B" | "C" | "D"> = {
  "1": "C", "2": "C", "3": "B", "4": "D", "5": "A",
  "6": "B", "7": "D", "8": "C", "9": "C", "10": "B",
};

export function getDpe(id: string): "A" | "B" | "C" | "D" {
  return DPE_BY_ID[id] ?? "C";
}

export function getSimilar(listing: Listing, count = 3): Listing[] {
  return LISTINGS.filter(
    (l) => l.id !== listing.id && l.isRental === listing.isRental
  ).slice(0, count);
}
