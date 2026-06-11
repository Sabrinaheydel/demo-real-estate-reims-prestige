import type { FormSubmission } from "@/lib/submissions.functions";
import portraitAvatar from "@/assets/photo-profil-1.jpg.asset.json";

export const ICON_URL = portraitAvatar.url;

// --- Preference helpers (localStorage) ---------------------------------------
export const PREF_KEYS = {
  enabled: "notifications_enabled",
  permission: "notifications_permission",
  sound: "admin_sound_enabled",
  night: "admin_night_mode",
} as const;

function lsGet(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function lsBool(key: string, defaultVal: boolean): boolean {
  const v = lsGet(key);
  if (v === "") return defaultVal;
  return v === "true";
}

export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}
export function permissionStatus(): NotificationPermission | "unsupported" {
  if (!isSupported()) return "unsupported";
  return Notification.permission;
}
export function isEnabled() {
  if (!isSupported()) return false;
  return Notification.permission === "granted" && lsBool(PREF_KEYS.enabled, false);
}
export function isSoundEnabled() {
  return lsBool(PREF_KEYS.sound, true);
}
export function isNightMode(): boolean {
  if (!lsBool(PREF_KEYS.night, false)) return false;
  const hour = new Date().getHours();
  return hour >= 20 || hour < 8;
}

export function setEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEYS.enabled, v ? "true" : "false");
}
export function setSoundEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEYS.sound, v ? "true" : "false");
}
export function setNightMode(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEYS.night, v ? "true" : "false");
}

export async function requestPermissionAndEnable(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  const res = await Notification.requestPermission();
  localStorage.setItem(PREF_KEYS.permission, res);
  if (res === "granted") setEnabled(true);
  return res;
}

// --- Formatting --------------------------------------------------------------
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

// --- Push notification -------------------------------------------------------
export function showRawNotification(opts: { title: string; body: string; tag?: string; url?: string }) {
  if (!isEnabled() || isNightMode()) return;
  try {
    const n = new Notification(opts.title, {
      body: opts.body,
      icon: ICON_URL,
      badge: "/favicon.ico",
      tag: opts.tag,
    });
    n.onclick = () => {
      window.focus();
      if (opts.url) window.location.href = opts.url;
    };
  } catch (e) { console.warn("[notifications] failed", e); }
}

export function showSubmissionNotification(s: FormSubmission) {
  const { title, body } = formatNotification(s);
  showRawNotification({ title, body, tag: `submission-${s.id}`, url: `/admin?open=${s.id}` });
}

// --- Web Audio "ding" --------------------------------------------------------
let audioCtx: AudioContext | null = null;
export function playDing(opts: { respectNight?: boolean; respectSound?: boolean } = {}) {
  const { respectNight = true, respectSound = true } = opts;
  if (respectSound && !isSoundEnabled()) return;
  if (respectNight && isNightMode()) return;
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
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch { /* ignore */ }
}

export function registerAdminServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch((e) => console.warn("[sw]", e));
}
