// Profil visiteur stocké en localStorage 30 jours.
// Sert au calcul de compatibilité locataire et à la qualification dossier.

export type ProfilProfessionnel =
  | "cdi"
  | "cdd"
  | "freelance"
  | "etudiant"
  | "retraite"
  | "autre";

export type Profile = {
  situation_pro: ProfilProfessionnel | "";
  revenus_mensuels: number; // valeur numérique
  revenus_label: string; // libellé tranche
  garant: "oui" | "non" | "";
  type_recherche: "location" | "achat" | "";
  updatedAt: number;
};

const KEY = "di_profile_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const REVENU_OPTIONS: { value: number; label: string }[] = [
  { value: 1200, label: "Moins de 1500€" },
  { value: 2000, label: "1500-2500€" },
  { value: 3000, label: "2500-3500€" },
  { value: 4000, label: "Plus de 3500€" },
];

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!p.updatedAt || Date.now() - p.updatedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function saveProfile(p: Omit<Profile, "updatedAt">) {
  if (typeof window === "undefined") return;
  const data: Profile = { ...p, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("di:profile-change"));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("di:profile-change"));
}

export type Compat = {
  status: "ok" | "ok-garant" | "limit" | "ko" | "missing";
  ratio: number; // 0..1
  badge: string;
  tone: "green" | "orange" | "red" | "muted";
};

export function computeCompat(rent: number, profile: Profile | null): Compat {
  if (!profile || !profile.revenus_mensuels || profile.type_recherche !== "location") {
    return { status: "missing", ratio: 0, badge: "🔍 Vérifier la compatibilité →", tone: "muted" };
  }
  const ratio = rent / profile.revenus_mensuels;
  if (ratio <= 0.33) {
    return { status: "ok", ratio, badge: "✅ Compatible avec votre profil", tone: "green" };
  }
  if (ratio <= 0.4 && profile.garant === "oui") {
    return { status: "ok-garant", ratio, badge: "✅ Compatible · Garant accepté", tone: "green" };
  }
  if (ratio <= 0.4) {
    return { status: "limit", ratio, badge: "⚠️ Loyer limite (33% revenus)", tone: "orange" };
  }
  return { status: "ko", ratio, badge: "❌ Loyer > 40% de vos revenus", tone: "red" };
}
