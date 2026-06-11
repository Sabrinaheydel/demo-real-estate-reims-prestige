// Shared helpers to build qualified emails to the agent.
// Every subject MUST start with a color emoji so the agent can triage at a glance.

export const AGENT_EMAIL = "contact@dupuis-immobilier.fr";
export const AGENT_PHONE = "+33326000000"; // utilisé pour tel:
export const AGENT_PHONE_DISPLAY = "+33 3 26 00 00 00";
export const AGENT_NAME = "Julien Dupuis";
export const SITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

// --- 1. Qualification colorée ----------------------------------------------

export type SaleIntent = "offre" | "visite" | "infos" | "rappel";

export function rentalScoreEmoji(ratioPct: number): { emoji: string; label: string } {
  if (ratioPct <= 25) return { emoji: "🟢", label: "SOLIDE" };
  if (ratioPct <= 33) return { emoji: "🟡", label: "BON" };
  if (ratioPct <= 40) return { emoji: "🟠", label: "LIMITE" };
  return { emoji: "🔴", label: "FRAGILE" };
}

export function saleIntentEmoji(intent: SaleIntent): string {
  switch (intent) {
    case "offre": return "🟢";
    case "visite": return "🟡";
    case "infos": return "🟠";
    case "rappel": return "🔵";
  }
}

export function generalEmoji(kind: "estimation" | "contact" | "urgent"): string {
  if (kind === "estimation") return "💰";
  if (kind === "urgent") return "🚨";
  return "📩";
}

// --- 2. Bloc "Actions rapides" en bas du corps -----------------------------

export type QuickActionsArgs = {
  firstName: string;
  prospectEmail: string;
  prospectPhone?: string;
  reference?: string;
  listingTitle?: string;
  listingId?: string | number;
};

function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function buildQuickActionsBlock(args: QuickActionsArgs): string {
  const ref = args.reference ?? "—";
  const replySubject = `Suite à votre demande — Réf. ${ref}`;
  const replyBody = `Bonjour ${args.firstName || ""},\n\nJ'ai bien reçu votre demande${
    args.listingTitle ? ` concernant ${args.listingTitle}` : ""
  }${args.reference ? ` (Réf. ${args.reference})` : ""}.\n\n\n\nCordialement,\n${AGENT_NAME}\nAgent immobilier indépendant\n${AGENT_PHONE_DISPLAY}`;
  const mailtoReply = `mailto:${args.prospectEmail}?subject=${encodeURIComponent(
    replySubject
  )}&body=${encodeURIComponent(replyBody)}`;

  const listingUrl = args.listingId
    ? `${SITE_ORIGIN}/annonces/${args.listingId}`
    : `${SITE_ORIGIN}/annonces`;
  const adminUrl = `${SITE_ORIGIN}/admin`;
  const callLink = args.prospectPhone ? `tel:${telHref(args.prospectPhone)}` : "";

  return [
    "",
    "══════════════════════════════",
    "⚡ ACTIONS RAPIDES",
    "══════════════════════════════",
    "",
    `📞 Appeler ${args.firstName || "le prospect"} maintenant :`,
    callLink || "  (téléphone non fourni)",
    callLink ? "→ Tapez pour appeler depuis mobile" : "",
    "",
    "✉️ Répondre par email :",
    mailtoReply,
    "→ Email pré-rempli en 1 clic",
    "",
    "🏠 Voir l'annonce concernée :",
    listingUrl,
    "→ Retrouver le bien en 1 clic",
    "",
    "📋 Voir tous les dossiers reçus :",
    adminUrl,
    "→ Tableau de bord complet",
    "",
    "══════════════════════════════",
    "Réponse recommandée : sous 2h",
    "Dupuis Immobilier · Système digital",
    "Propulsé par Agence 360 Digital",
    "agence360digital.fr",
    "══════════════════════════════",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// --- 3. Envoi mailto unifié ------------------------------------------------

export function openAgentMailto(subject: string, bodyLines: string[], quick: QuickActionsArgs) {
  const body = [...bodyLines, buildQuickActionsBlock(quick)].join("\n");
  window.location.href = `mailto:${AGENT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
