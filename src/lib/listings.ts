import annonce1Asset from "@/assets/annonce-1-appartement-haussmannien.png.asset.json";
import annonce2Asset from "@/assets/annonce-2-maison-familiale.png.asset.json";
import annonce3Asset from "@/assets/annonce-3-deux-pieces-traversant.png.asset.json";
import annonce3NewAsset from "@/assets/annonce-3-studio-design-proche-chu.png.asset.json";
import annonce4Asset from "@/assets/annonce-4-villa-contemporaine.png.asset.json";
import annonce5Asset from "@/assets/annonce-5-studio-renove.png.asset.json";
import annonce6Asset from "@/assets/annonce-6-maison-de-caractere.png.asset.json";
import annonce6NewAsset from "@/assets/annonce-6-appartement-t3-lumineux-sacres.png.asset.json";
import annonce7Asset from "@/assets/annonce-7-appartement-t4-standing.png.asset.json";
import annonce9NewAsset from "@/assets/annonce-9-t2-calme-lumineux-securisee.png.asset.json";
import loc1Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_05_3.png.asset.json";
import loc2Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_06_6.png.asset.json";
import loc3Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_05_4.png.asset.json";
import loc4Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_04_1.png.asset.json";
import loc5Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_04_1.png.asset.json";
import loc6Asset from "@/assets/ChatGPT_Image_11_juin_2026_10_01_04_2.png.asset.json";

export type ListingStatus = "vente" | "location" | "exclusivite";
export type PropertyType = "appartement" | "maison" | "villa" | "studio";
export type DpeGrade = "A" | "B" | "C" | "D";

export type Listing = {
  id: string;
  reference: string;
  status: ListingStatus[];
  price: number;
  priceLabel: string;
  priceNote?: string;
  isRental: boolean;
  title: string;
  propertyType: PropertyType;
  surface: number;
  rooms: number | null;
  bedrooms: number | null;
  parking: boolean;
  floor?: string | null;
  cellar?: boolean;
  furnished?: boolean;
  availableFrom?: string;
  availabilityTag?: "immediate" | "this-month" | "within-3-months";
  rentExcludingCharges?: number;
  estimatedCharges?: number;
  deposit?: number;
  tenantFees?: number;
  animalsAccepted?: string;
  dpe: DpeGrade;
  features: string[];
  neighborhood: string;
  description: string;
  photos: string[];
};

export const LISTINGS: Listing[] = [
  {
    id: "1",
    reference: "DI-2024-001",
    status: ["vente", "exclusivite"],
    price: 289000,
    priceLabel: "289 000 €",
    isRental: false,
    title: "Appartement haussmannien rénové Centre historique",
    propertyType: "appartement",
    surface: 94,
    rooms: 4,
    bedrooms: 3,
    parking: false,
    floor: "3e",
    cellar: true,
    dpe: "C",
    features: ["Cave", "Ascenseur", "Parquet ancien"],
    neighborhood: "Centre-ville. Rue Cérès",
    description:
      "Magnifique appartement haussmannien entièrement rénové avec goût. Hauts plafonds, parquet ancien, moulures d'époque. Séjour double lumineux, cuisine équipée ouverte, 3 chambres dont une suite parentale. Immeuble pierre de taille, ascenseur, cave. Un bien rare dans le secteur le plus recherché de Reims.",
    photos: [annonce1Asset.url, annonce1Asset.url, annonce1Asset.url],
  },
  {
    id: "2",
    reference: "DI-2024-002",
    status: ["vente"],
    price: 347000,
    priceLabel: "347 000 €",
    isRental: false,
    title: "Maison familiale avec jardin. Secteur Clairmarais",
    propertyType: "maison",
    surface: 138,
    rooms: 6,
    bedrooms: 4,
    parking: true,
    floor: "Maison",
    cellar: false,
    dpe: "C",
    features: ["Jardin 280 m²", "Garage double", "Cheminée"],
    neighborhood: "Clairmarais",
    description:
      "Belle maison de ville années 30 pleine de caractère. Séjour avec cheminée, salle à manger, cuisine indépendante. 4 chambres à l'étage, salle de bain et salle d'eau. Jardin arboré exposé sud, garage double. Secteur calme prisé des familles, à 10 min à pied de la cathédrale.",
    photos: [annonce2Asset.url, annonce2Asset.url, annonce2Asset.url],
  },
  {
    id: "3",
    reference: "DI-2024-003",
    status: ["vente"],
    price: 129000,
    priceLabel: "129 000 €",
    isRental: false,
    title: "Studio design proche CHU. Idéal premier achat",
    propertyType: "studio",
    surface: 32,
    rooms: 1,
    bedrooms: null,
    parking: false,
    floor: "2e",
    cellar: false,
    furnished: false,
    dpe: "B",
    features: ["Cuisine équipée", "Fibre", "Digicode"],
    neighborhood: "Jean Jaurès. Proximité CHU",
    description:
      "Studio entièrement rénové, idéal pour un premier achat ou un investissement patrimonial. Coin nuit séparé, cuisine équipée, salle d'eau moderne et très belle luminosité. Immeuble sécurisé avec digicode. Situation recherchée à proximité du CHU et des transports.",
    photos: [annonce3NewAsset.url, annonce3NewAsset.url, annonce3NewAsset.url],
  },
...
  {
    id: "6",
    reference: "DI-2024-006",
    status: ["vente"],
    price: 198000,
    priceLabel: "198 000 €",
    isRental: false,
    title: "Appartement T3 lumineux. Quartier des Sacres",
    propertyType: "appartement",
    surface: 72,
    rooms: 3,
    bedrooms: 2,
    parking: true,
    floor: "2e",
    cellar: false,
    dpe: "B",
    features: ["Balcon sud", "Parking privatif", "Récent"],
    neighborhood: "Quartier des Sacres",
    description:
      "Bel appartement familial refait à neuf dans un immeuble récent. Double séjour lumineux, cuisine ouverte équipée, 2 belles chambres, salle de bain et WC séparés. Balcon orienté sud, parking privatif. Proche commerces, écoles et transports.",
    photos: [annonce6NewAsset.url, annonce6NewAsset.url, annonce6NewAsset.url],
  },
...
  {
    id: "9",
    reference: "DI-2024-009",
    status: ["vente"],
    price: 149000,
    priceLabel: "149 000 €",
    isRental: false,
    title: "T2 calme et lumineux. Résidence sécurisée",
    propertyType: "appartement",
    surface: 44,
    rooms: 2,
    bedrooms: 1,
    parking: true,
    floor: "2e",
    cellar: true,
    dpe: "C",
    features: ["Parking", "Cave", "Gardien"],
    neighborhood: "Avenue de Laon",
    description:
      "Beau T2 dans résidence sécurisée avec gardien. Séjour lumineux, chambre séparée, cuisine équipée, salle de bain refaite. Parking et cave inclus. Environnement calme et verdoyant, tous commerces à pied.",
    photos: [annonce9NewAsset.url, annonce9NewAsset.url, annonce9NewAsset.url],
  },
  {
    id: "10",
    reference: "DI-2024-010",
    status: ["vente"],
    price: 236000,
    priceLabel: "236 000 €",
    isRental: false,
    title: "Appartement T4 familial. Résidence de standing",
    propertyType: "appartement",
    surface: 89,
    rooms: 4,
    bedrooms: 3,
    parking: true,
    floor: "3e",
    cellar: true,
    dpe: "B",
    features: ["Parking souterrain", "Gardien", "Cave"],
    neighborhood: "Laon. Clairmarais",
    description:
      "Spacieux T4 dans résidence gardiennée de standing. Grand séjour double, 3 chambres, cuisine équipée, deux salles d'eau. Parking souterrain, cave. Charges raisonnables. Idéal famille ou investissement patrimonial.",
    photos: [annonce7Asset.url, annonce7Asset.url, annonce7Asset.url],
  },
  {
    id: "11",
    reference: "DI-LOC-001",
    status: ["location"],
    price: 490,
    priceLabel: "490 €/mois",
    priceNote: "CC",
    isRental: true,
    title: "Studio meublé rénové. Hypercentre Reims",
    propertyType: "studio",
    surface: 28,
    rooms: 1,
    bedrooms: null,
    parking: false,
    floor: "2e",
    cellar: false,
    furnished: true,
    availableFrom: "Immédiatement",
    availabilityTag: "immediate",
    rentExcludingCharges: 450,
    estimatedCharges: 40,
    deposit: 450,
    tenantFees: 224,
    animalsAccepted: "À préciser",
    dpe: "C",
    features: ["Meublé", "Digicode", "Interphone"],
    neighborhood: "Hypercentre. Rue de Vesle",
    description:
      "Studio entièrement meublé et équipé, refait à neuf en 2023. Lit double, canapé, cuisine équipée (réfrigérateur, plaques, micro-ondes), salle d'eau moderne. Double vitrage, parquet flottant. Immeuble sécurisé avec digicode et interphone. Idéalement situé à 5 min à pied de la place d'Erlon et des transports. Charges comprises (eau froide, ordures ménagères). Parfait pour étudiant ou jeune actif.",
    photos: [loc1Asset.url, "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", loc1Asset.url],
  },
  {
    id: "12",
    reference: "DI-LOC-002",
    status: ["location"],
    price: 680,
    priceLabel: "680 €/mois",
    priceNote: "+ charges",
    isRental: true,
    title: "T2 lumineux avec balcon. Quartier Clairmarais",
    propertyType: "appartement",
    surface: 48,
    rooms: 2,
    bedrooms: 1,
    parking: false,
    floor: "3e",
    cellar: true,
    furnished: false,
    availableFrom: "1er juillet 2026",
    availabilityTag: "within-3-months",
    rentExcludingCharges: 680,
    estimatedCharges: 70,
    deposit: 680,
    tenantFees: 384,
    animalsAccepted: "À préciser",
    dpe: "B",
    features: ["Balcon", "Cave", "Cuisine équipée"],
    neighborhood: "Clairmarais",
    description:
      "Beau T2 traversant très lumineux au 3ème étage sans ascenseur. Séjour avec balcon orienté sud, cuisine séparée équipée, chambre double, salle de bain avec baignoire, WC séparés. Cave privative. Quartier calme et résidentiel très prisé, proche commerces et écoles. Chauffage collectif au gaz inclus dans les charges.",
    photos: [loc2Asset.url, "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", loc2Asset.url],
  },
  {
    id: "13",
    reference: "DI-LOC-003",
    status: ["location"],
    price: 850,
    priceLabel: "850 €/mois",
    priceNote: "+ charges",
    isRental: true,
    title: "T3 familial calme. Résidence sécurisée Avenue de Laon",
    propertyType: "appartement",
    surface: 68,
    rooms: 3,
    bedrooms: 2,
    parking: true,
    floor: "2e",
    cellar: true,
    furnished: false,
    availableFrom: "15 juillet 2026",
    availabilityTag: "within-3-months",
    rentExcludingCharges: 850,
    estimatedCharges: 90,
    deposit: 850,
    tenantFees: 544,
    animalsAccepted: "À préciser",
    dpe: "C",
    features: ["Parking", "Cave", "Résidence sécurisée"],
    neighborhood: "Avenue de Laon",
    description:
      "Grand T3 dans résidence sécurisée avec gardien à mi-temps. Double séjour lumineux, cuisine équipée ouverte, 2 chambres (12 et 14 m²), salle de bain refaite, WC séparés. Parking souterrain et cave inclus. Environnement calme et verdoyant, à 10 min du centre-ville en tramway. Idéal pour famille ou colocation.",
    photos: [loc3Asset.url, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", loc3Asset.url],
  },
  {
    id: "14",
    reference: "DI-LOC-004",
    status: ["location"],
    price: 1050,
    priceLabel: "1 050 €/mois",
    priceNote: "+ charges",
    isRental: true,
    title: "T4 spacieux avec terrasse. Secteur Jean Jaurès",
    propertyType: "appartement",
    surface: 89,
    rooms: 4,
    bedrooms: 3,
    parking: true,
    floor: "Dernier étage",
    cellar: false,
    furnished: false,
    availableFrom: "1er août 2026",
    availabilityTag: "within-3-months",
    rentExcludingCharges: 1050,
    estimatedCharges: 110,
    deposit: 1050,
    tenantFees: 712,
    animalsAccepted: "À préciser",
    dpe: "B",
    features: ["Terrasse 15 m²", "Garage", "Suite parentale"],
    neighborhood: "Jean Jaurès",
    description:
      "Superbe T4 en dernier étage avec grande terrasse privative de 15 m². Séjour double avec accès terrasse, cuisine américaine équipée haut de gamme, 3 chambres dont une suite parentale avec salle d'eau privative, salle de bain principale. Garage individuel en sous-sol. Vue dégagée, luminosité exceptionnelle. Proche commerces, restaurants et arrêt tramway.",
    photos: [loc4Asset.url, "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", loc4Asset.url],
  },
  {
    id: "15",
    reference: "DI-LOC-005",
    status: ["location"],
    price: 920,
    priceLabel: "920 €/mois",
    priceNote: "CC",
    isRental: true,
    title: "T2 meublé haut de gamme. Centre historique",
    propertyType: "appartement",
    surface: 55,
    rooms: 2,
    bedrooms: 1,
    parking: false,
    floor: "2e",
    cellar: true,
    furnished: true,
    availableFrom: "Immédiatement",
    availabilityTag: "immediate",
    rentExcludingCharges: 800,
    estimatedCharges: 120,
    deposit: 800,
    tenantFees: 440,
    animalsAccepted: "À préciser",
    dpe: "C",
    features: ["Meublé", "Cave", "Fibre incluse"],
    neighborhood: "Centre historique. Proche cathédrale",
    description:
      "Appartement meublé avec goût dans immeuble haussmannien pierre de taille. Hauts plafonds, parquet ancien, moulures d'époque. Équipement complet et qualitatif (literie haut de gamme, électroménager récent, fibre optique incluse). Idéal pour expatrié, mutation professionnelle ou séjour longue durée. Toutes charges comprises (eau, chauffage, internet).",
    photos: [loc5Asset.url, "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", loc5Asset.url],
  },
  {
    id: "16",
    reference: "DI-LOC-006",
    status: ["location"],
    price: 1200,
    priceLabel: "1 200 €/mois",
    priceNote: "+ charges",
    isRental: true,
    title: "Maison avec jardin. Cormontreuil (proche Reims)",
    propertyType: "maison",
    surface: 110,
    rooms: 5,
    bedrooms: 3,
    parking: true,
    floor: "Maison",
    cellar: false,
    furnished: false,
    availableFrom: "1er septembre 2026",
    availabilityTag: "within-3-months",
    rentExcludingCharges: 1200,
    estimatedCharges: 60,
    deposit: 1200,
    tenantFees: 880,
    animalsAccepted: "À préciser",
    dpe: "D",
    features: ["Jardin 200 m²", "Garage double", "Buanderie"],
    neighborhood: "Cormontreuil. 8 min de Reims",
    description:
      "Belle maison de ville avec jardin arboré exposé sud. Séjour avec cheminée décorative, salle à manger, cuisine indépendante équipée, buanderie. 3 chambres à l'étage, salle de bain et salle d'eau. Garage double, jardin entièrement clôturé idéal pour enfants et animaux. Quartier résidentiel calme, écoles à pied, accès rapide centre Reims.",
    photos: [loc6Asset.url, "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", loc6Asset.url],
  },
];

export const NEIGHBORHOODS = Array.from(
  new Set(LISTINGS.map((l) => l.neighborhood.split(". ")[0].trim()))
).sort();

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getListingReference(id: string): string {
  return getListing(id)?.reference ?? id;
}

export function getDpe(id: string): DpeGrade {
  return getListing(id)?.dpe ?? "C";
}

export function getSimilar(listing: Listing, count = 3): Listing[] {
  return LISTINGS.filter((l) => l.id !== listing.id && l.isRental === listing.isRental)
    .sort((a, b) => {
      const aScore = Number(a.propertyType === listing.propertyType);
      const bScore = Number(b.propertyType === listing.propertyType);
      return bScore - aScore;
    })
    .slice(0, count);
}
