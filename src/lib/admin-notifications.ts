import type { FormSubmission } from "@/lib/submissions.functions";
import portraitAvatar from "@/assets/photo-profil-1.jpg.asset.json";

export const ICON_URL = portraitAvatar.url;

export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}
export function isEnabled() {
  if (!isSupported()) return false;
  return Notification.permission === "granted" && localStorage.getItem("notifications_enabled") === "true";
}

export function formatNotification(s: FormSubmission): { title: string; body: string } {
  const prenom = s.prenom || "—";
  const d = s.donnees_completes ?? {};
  const ref = s.reference_annonce || (d.referenceAnnonce as string | undefined) || "";
  switch (s.form_type) {
    case "estimation-vendre":
      return { title: "🏠 Nouvelle estimation", body: `${prenom} — ${(d.typeBien as string) || (d.quartier as string) || "Bien à estimer"}\nRépondre sous 48h` };
    case "contact-annonce-vente":
      return { title: "🏠 Contact annonce", body: `${prenom} — Réf. ${ref}\n${(d.typeDemande as string) || "Demande"}` };
    case "candidature-location": {
      const taux = d.tauxEffort as number | undefined;
      return { title: "🔑 Candidature location", body: `${prenom} — Réf. ${ref}${taux ? `\nTaux effort : ${taux}%` : ""}` };
    }
    case "mise-en-gestion-locative":
      return { title: "🏢 Gestion locative", body: `${prenom} — ${(d.typeBien as string) || ""} ${(d.quartier as string) || ""}`.trim() };
    case "recherche-achat":
      return { title: "🔍 Recherche achat", body: `${prenom} — Budget ${(d.budget as string) || "?"}\n${(d.typeBien as string) || ""} ${(d.quartier as string) || ""}`.trim() };
    case "rappel-rapide-homepage":
      return { title: "📞 Rappel demandé", body: `${prenom} — ${s.telephone || "—"}\nÀ rappeler rapidement` };
    case "contact-general":
    default:
      return { title: "✉️ Nouveau message", body: `${prenom} — ${(d.typeDemande as string) || ((d.message as string) || "").slice(0, 80) || "Demande"}` };
  }
}

export function showSubmissionNotification(s: FormSubmission) {
  if (!isEnabled()) return;
  const { title, body } = formatNotification(s);
  try {
    const n = new Notification(title, {
      body,
      icon: ICON_URL,
      badge: "/favicon.ico",
      tag: `submission-${s.id}`,
    });
    n.onclick = () => {
      window.focus();
      window.location.href = `/admin?open=${s.id}`;
    };
  } catch (e) {
    console.warn("[notifications] failed", e);
  }
}

let audioCtx: AudioContext | null = null;
export function playDing() {
  try {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

export function registerAdminServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch((e) => console.warn("[sw]", e));
}
