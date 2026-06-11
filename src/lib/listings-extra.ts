// Données géo + mobilier inclus, séparées du fichier principal pour éviter d'éditer
// l'array LISTINGS à chaque mise à jour.

export const LISTING_COORDS: Record<string, { lat: number; lng: number }> = {
  "1": { lat: 49.2571, lng: 4.0377 },
  "2": { lat: 49.2634, lng: 4.0456 },
  "3": { lat: 49.2556, lng: 4.0298 },
  "4": { lat: 49.2543, lng: 4.0334 },
  "5": { lat: 49.2156, lng: 4.0012 },
  "6": { lat: 49.2612, lng: 4.0234 },
  "7": { lat: 49.2547, lng: 4.0312 },
  "8": { lat: 49.2198, lng: 4.0934 },
  "9": { lat: 49.2689, lng: 4.0245 },
  "10": { lat: 49.2678, lng: 4.0489 },
  "11": { lat: 49.2543, lng: 4.0334 }, // L1 - Rue de Vesle
  "12": { lat: 49.2645, lng: 4.0423 }, // L2 - Clairmarais
  "13": { lat: 49.2701, lng: 4.0267 }, // L3 - Avenue de Laon
  "14": { lat: 49.2623, lng: 4.0512 }, // L4 - Jean Jaurès
  "15": { lat: 49.2563, lng: 4.0356 }, // L5 - Centre historique
  "16": { lat: 49.2212, lng: 4.0867 }, // L6 - Cormontreuil
};

export const FURNISHED_ITEMS = [
  "Literie",
  "Canapé",
  "Table + chaises",
  "Électroménager complet",
  "Rangements",
  "Internet inclus",
];
