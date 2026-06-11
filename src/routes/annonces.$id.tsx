import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { Listing } from "@/lib/listings";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Lightbox } from "@/components/site/Lightbox";
import { ListingCard } from "@/components/site/ListingCard";
import { getListing, getSimilar, getListingReference, getDpe } from "@/lib/listings";
import { FURNISHED_ITEMS } from "@/lib/listings-extra";
import { computeCompat, REVENU_OPTIONS } from "@/lib/profile";
import { useProfile } from "@/hooks/useProfile";
import {
  ArrowLeft,
  MapPin,
  Maximize,
  Home as HomeIcon,
  Bed,
  Car,
  Check,
  Package,
  Building2,
  Sofa,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/annonces/$id")({
  loader: ({ params }) => {
    const listing = getListing(params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    return {
      meta: l
        ? [
            { title: `${l.title} · Dupuis Immobilier` },
            { name: "description", content: l.description.slice(0, 160) },
            { property: "og:title", content: l.title },
            { property: "og:description", content: l.description.slice(0, 160) },
            { property: "og:image", content: l.photos[0] },
          ]
        : [{ title: "Bien introuvable · Dupuis Immobilier" }],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-display text-3xl text-navy mb-3">Une erreur est survenue</h1>
        <p className="text-foreground/70 mb-6">{error.message}</p>
        <button
          onClick={() => {
            reset();
            router.invalidate();
          }}
          className="px-5 py-2.5 rounded-lg bg-gold text-navy font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="pt-40 pb-24 px-6 text-center">
        <h1 className="font-display text-4xl text-navy mb-4">Bien introuvable</h1>
        <p className="text-foreground/70 mb-8">Ce bien n'est plus disponible ou n'existe pas.</p>
        <Link to="/annonces" className="inline-flex items-center px-6 py-3 rounded-lg bg-gold text-navy font-semibold">
          Retour aux annonces
        </Link>
      </main>
      <Footer />
    </div>
  ),
  component: ListingDetailPage,
});

const DPE_STYLES: Record<"A" | "B" | "C" | "D", string> = {
  A: "bg-green-600 text-white",
  B: "bg-lime-500 text-white",
  C: "bg-yellow-400 text-navy",
  D: "bg-orange-500 text-white",
};

type SaleIntent = "visite" | "infos" | "offre" | "rappel";
const SALE_INTENT_LABEL: Record<SaleIntent, string> = {
  visite: "Organiser une visite",
  infos: "Obtenir plus d'informations",
  offre: "Faire une offre",
  rappel: "Être rappelé(e)",
};

const REVENU_VALUES = REVENU_OPTIONS;

const DOCUMENT_OPTIONS = [
  "3 derniers bulletins de salaire",
  "Dernier avis d'imposition",
  "Pièce d'identité",
  "Justificatif de domicile actuel",
  "Contrat de travail",
];

function CompatBlock({ listing }: { listing: Listing }) {
  const profile = useProfile();
  const compat = computeCompat(listing.price, profile);
  if (compat.status === "missing") {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-border bg-cream/60 p-5 text-sm">
        <p className="text-navy font-medium mb-2">Votre compatibilité</p>
        <p className="text-foreground/70 mb-3">
          Renseignez votre profil pour vérifier si ce loyer est compatible avec vos revenus.
        </p>
        <Link
          to="/louer"
          hash="profil"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-gold hover:text-navy transition-colors"
        >
          Renseigner mon profil
        </Link>
      </div>
    );
  }
  const tone =
    compat.tone === "green"
      ? "border-emerald-200 bg-emerald-50"
      : compat.tone === "orange"
        ? "border-amber-200 bg-amber-50"
        : "border-red-200 bg-red-50";
  const pct = (compat.ratio * 100).toFixed(1).replace(".", ",");
  const recommendation =
    compat.status === "ko"
      ? "📌 Recommandation : prévoir un garant ou justifier de revenus du foyer plus élevés."
      : compat.status === "limit"
        ? "📌 Recommandation : un garant ou des revenus complémentaires renforceront votre dossier."
        : "✅ Votre dossier est conforme aux critères bancaires (≤ 33% des revenus).";
  return (
    <div className={`mb-8 rounded-xl border ${tone} p-5 text-sm`}>
      <p className="text-navy font-medium mb-1">Votre compatibilité</p>
      <p className="text-foreground/80 mb-1">
        Basé sur vos revenus déclarés ({profile!.revenus_mensuels.toLocaleString("fr-FR")}€/mois) :
      </p>
      <p className="text-navy font-semibold mb-2">
        Loyer : {listing.price}€ = {pct}% de vos revenus
      </p>
      <p className="text-foreground/80 mb-3">{recommendation}</p>
      <Link
        to="/louer"
        hash="profil"
        className="inline-flex items-center text-xs font-semibold text-navy underline hover:text-gold"
      >
        Mettre à jour mon profil
      </Link>
    </div>
  );
}

function FurnishedExpander() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[#7C3AED]/30 bg-[#7C3AED]/5 px-4 py-3 col-span-2 sm:col-span-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm text-navy font-semibold"
      >
        <span className="flex items-center gap-2">
          <Sofa size={16} className="text-[#7C3AED]" /> Meublé : Oui (liste fournie)
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-foreground/80">
          {FURNISHED_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check size={12} className="text-[#7C3AED]" /> {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListingDetailPage() {
  const { listing } = Route.useLoaderData() as { listing: Listing };
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const similar = getSimilar(listing);
  const reference = getListingReference(listing.id);
  const dpe = getDpe(listing.id);
  const profile = useProfile();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    intent: "visite" as SaleIntent,
    day: "",
    slot: "",
    message: "",
    rgpd: false,
    // rental specific
    profession: "",
    revenusLabel: profile?.revenus_label ?? "",
    revenusValue: profile?.revenus_mensuels ?? 0,
    revenusFoyerLabel: "",
    revenusFoyerValue: 0,
    contractDetail: "",
    garantType: "",
    documents: [] as string[],
    entryDate: "",
  });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const statusLabel: Record<string, string> = {
    vente: "À vendre",
    location: "À louer",
    exclusivite: "Exclusivité",
  };

  function toggleDoc(doc: string) {
    setForm((f) => ({
      ...f,
      documents: f.documents.includes(doc) ? f.documents.filter((d) => d !== doc) : [...f.documents, doc],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid || !form.rgpd) return;

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    if (listing.isRental) {
      const ratio = form.revenusValue ? (listing.price / form.revenusValue) * 100 : 0;
      const tauxStr = ratio ? `${ratio.toFixed(1).replace(".", ",")}%` : "—";
      const conform = ratio && ratio <= 33 ? "✅ Conforme" : ratio && ratio <= 40 ? "⚠️ Limite" : "❌ À renforcer";
      const subject = `🔑 Pré-dossier complet — Réf. ${reference} — ${fullName} — Revenus : ${form.revenusValue}€ — Taux effort : ${tauxStr}`;
      const lines = [
        "═══════════════════════════",
        `CANDIDATURE — Réf. ${reference}`,
        `${listing.title} — ${listing.priceLabel}`,
        "═══════════════════════════",
        "",
        "👤 PROFIL CANDIDAT",
        `Nom : ${fullName}`,
        `Email : ${form.email}`,
        `Téléphone : ${form.phone}`,
        `Situation : ${form.profession || "—"}${form.contractDetail ? ` (${form.contractDetail})` : ""}`,
        `Revenus nets : ${form.revenusValue ? form.revenusValue + "€/mois" : "—"} (${form.revenusLabel || "—"})`,
        `Revenus foyer : ${form.revenusFoyerValue ? form.revenusFoyerValue + "€/mois" : "—"}`,
        "",
        "📊 ANALYSE FINANCIÈRE",
        `Loyer demandé : ${listing.price}€/mois`,
        `Taux d'effort : ${tauxStr} des revenus`,
        `Statut : ${conform}`,
        "",
        "🛡️ GARANTIES",
        `Garant : ${form.garantType ? `Oui · ${form.garantType}` : "Non précisé"}`,
        `Documents disponibles :`,
        ...(form.documents.length ? form.documents.map((d) => `  • ${d}`) : ["  • Aucun document coché"]),
        "",
        "📅 PROJET",
        `Date d'entrée souhaitée : ${form.entryDate || "—"}`,
        `Demande : ${form.intent === "visite" ? "Visite" : form.intent === "infos" ? "Infos" : "Candidature"}`,
        ...(form.intent === "visite" && (form.day || form.slot) ? [`Disponibilités : ${form.day || "—"} / ${form.slot || "—"}`] : []),
        "",
        "💬 MESSAGE",
        form.message.trim() || "—",
        "",
        ...(pageUrl ? [`Lien de l'annonce : ${pageUrl}`, ""] : []),
        "═══════════════════════════",
        "Dossier généré automatiquement",
        "par Dupuis Immobilier · Système digital",
        "═══════════════════════════",
      ];
      const body = lines.join("\n");
      window.location.href = `mailto:contact@dupuis-immobilier.fr?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      setSent(true);
      return;
    }

    const intentLabel = SALE_INTENT_LABEL[form.intent];
    const subject = `🏠 Nouvelle demande — Réf. ${reference} — ${fullName} — ${intentLabel}`;
    const lines = [
      `Référence : ${reference}`,
      `Bien : ${listing.title}`,
      `Prix : ${listing.priceLabel}`,
      "",
      `Nom complet : ${fullName}`,
      `Email : ${form.email}`,
      `Téléphone : ${form.phone}`,
      "",
      `Type de demande : ${intentLabel}`,
    ];
    if (form.intent === "visite" && (form.day || form.slot)) {
      lines.push(`Disponibilités : ${form.day || "—"} / ${form.slot || "—"}`);
    }
    if (form.message.trim()) {
      lines.push("", "Message :", form.message.trim());
    }
    if (pageUrl) {
      lines.push("", `Lien de l'annonce : ${pageUrl}`);
    }
    const body = lines.join("\n");
    window.location.href = `mailto:contact@dupuis-immobilier.fr?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const inputCls =
    "w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm";

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs
        items={[
          { label: "Annonces", to: "/annonces" },
          { label: listing.title },
        ]}
      />
      <main className="pt-6 pb-24">
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <Link
            to="/annonces"
            className="inline-flex items-center gap-2 text-sm text-navy hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Retour aux annonces
          </Link>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full rounded-xl overflow-hidden bg-cream cursor-zoom-in group"
              aria-label="Agrandir la photo"
            >
              <img
                src={listing.photos[activePhoto]}
                alt={listing.title}
                className="w-full object-cover transition-transform group-hover:scale-[1.01]"
                style={{ height: "420px" }}
              />
            </button>
          </div>
          {listing.photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-10 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:gap-4 snap-x">
              {listing.photos.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActivePhoto(i);
                    setLightboxOpen(true);
                  }}
                  className={`shrink-0 w-[28vw] min-w-[120px] lg:w-auto rounded-lg overflow-hidden bg-cream aspect-[4/3] snap-start transition-all ${
                    activePhoto === i
                      ? "border-2 border-gold"
                      : "border-2 border-transparent hover:border-gold/40 opacity-90"
                  }`}
                  aria-label={`Voir photo ${i + 1}`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <Lightbox
            photos={listing.photos}
            open={lightboxOpen}
            index={activePhoto}
            onChange={setActivePhoto}
            onClose={() => setLightboxOpen(false)}
            alt={listing.title}
          />

          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {listing.furnished && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#7C3AED] text-white">
                    🛋️ Meublé
                  </span>
                )}
                {listing.status.map((s) => (
                  <span
                    key={s}
                    className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                      s === "exclusivite"
                        ? "bg-gold text-navy"
                        : s === "location"
                          ? "bg-rental text-white"
                          : "bg-navy text-white"
                    }`}
                  >
                    {statusLabel[s]}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-navy mb-3">{listing.title}</h1>
              <div className="flex items-center gap-2 text-foreground/70 mb-6">
                <MapPin size={16} className="text-gold" />
                <span>{listing.neighborhood}, Reims</span>
              </div>
              <div className="font-display text-4xl sm:text-5xl text-navy mb-2">{listing.priceLabel}</div>
              {listing.priceNote && (
                <div className="text-xs text-foreground/50 mb-6">{listing.priceNote}</div>
              )}

              {listing.isRental && <CompatBlock listing={listing} />}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Maximize, label: "Surface", value: `${listing.surface} m²` },
                  listing.rooms !== null && { icon: HomeIcon, label: "Pièces", value: `${listing.rooms}` },
                  listing.bedrooms !== null && { icon: Bed, label: "Chambres", value: `${listing.bedrooms}` },
                  { icon: Car, label: "Parking", value: listing.parking ? "Oui" : "Non" },
                  { icon: Building2, label: "Étage", value: listing.floor ?? "—" },
                  { icon: Package, label: "Cave", value: listing.cellar || listing.features.some((f) => f.toLowerCase().includes("cave")) ? "Oui" : "—" },
                ]
                  .filter(Boolean)
                  .map((row) => {
                    const r = row as { icon: typeof Maximize; label: string; value: string };
                    const Icon = r.icon;
                    return (
                      <div key={r.label} className="rounded-lg border border-border bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60 mb-1">
                          <Icon size={14} className="text-gold" /> {r.label}
                        </div>
                        <div className="text-navy font-semibold">{r.value}</div>
                      </div>
                    );
                  })}
              </div>

              {listing.furnished && (
                <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <FurnishedExpander />
                </div>
              )}

              <hr className="border-0 h-px bg-gold/40 mb-10" />

              <div className="mb-10">
                <h2 className="font-display text-2xl text-navy mb-4">Description</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {listing.features.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-2xl text-navy mb-4">Points forts</h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {listing.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check size={16} className="text-gold" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-8 flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider text-foreground/60">DPE</span>
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md font-display text-lg font-bold ${DPE_STYLES[dpe]}`}>
                  {dpe}
                </span>
              </div>

              <p className="text-xs text-foreground/50">Réf. {reference}</p>
            </div>

            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-navy text-white rounded-xl p-7 shadow-card">
                <h3 className="font-display text-2xl text-white mb-1">
                  {listing.isRental ? "Constituez votre pré-dossier" : "Vous êtes intéressé(e) ?"}
                </h3>
                <p className="text-gold text-xs font-semibold tracking-wider mb-6">
                  Réf. {reference}
                </p>
                {sent ? (
                  <div className="bg-gold/15 border border-gold/40 rounded-lg p-5 text-center">
                    <Check size={28} className="mx-auto text-gold mb-3" />
                    <p className="text-white font-semibold mb-2">
                      ✅ Votre {listing.isRental ? "pré-dossier" : "demande"} a été envoyé !
                    </p>
                    <p className="text-white/80 text-sm">
                      Julien Dupuis vous recontacte sous 24h pour la Réf. {reference}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="Prénom" maxLength={60} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} />
                      <input required placeholder="Nom" maxLength={60} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <input
                        required
                        type="email"
                        placeholder="Email"
                        maxLength={120}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`${inputCls} ${form.email && !emailValid ? "border-red-400" : ""}`}
                      />
                      {form.email && !emailValid && (
                        <p className="text-xs text-red-300 mt-1">Email invalide</p>
                      )}
                    </div>
                    <input required type="tel" placeholder="Téléphone" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />

                    {listing.isRental && (
                      <>
                        <div className="pt-2">
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Situation professionnelle</p>
                          <select required value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className={inputCls}>
                            <option value="" className="text-navy">Sélectionner...</option>
                            {["CDI", "CDD", "Freelance / Indépendant", "Étudiant", "Retraité", "Autre"].map((s) => (
                              <option key={s} value={s} className="text-navy">{s}</option>
                            ))}
                          </select>
                        </div>

                        {(form.profession === "CDI" || form.profession === "CDD") && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Détail du contrat</p>
                            <div className="space-y-1.5 text-sm">
                              {(form.profession === "CDI"
                                ? ["CDI période d'essai terminée", "CDI période d'essai en cours"]
                                : ["CDD < 6 mois", "CDD 6-12 mois", "CDD > 12 mois"]
                              ).map((opt) => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer text-white/90">
                                  <input
                                    type="radio"
                                    name="contractDetail"
                                    checked={form.contractDetail === opt}
                                    onChange={() => setForm({ ...form, contractDetail: opt })}
                                    className="accent-[var(--color-gold)]"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Revenus mensuels nets</p>
                          <select
                            required
                            value={form.revenusLabel}
                            onChange={(e) => {
                              const opt = REVENU_VALUES.find((o) => o.label === e.target.value);
                              setForm({ ...form, revenusLabel: opt?.label ?? "", revenusValue: opt?.value ?? 0 });
                            }}
                            className={inputCls}
                          >
                            <option value="" className="text-navy">Sélectionner...</option>
                            {REVENU_VALUES.map((o) => (
                              <option key={o.label} value={o.label} className="text-navy">{o.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Revenus du foyer (optionnel)</p>
                          <select
                            value={form.revenusFoyerLabel}
                            onChange={(e) => {
                              const opt = REVENU_VALUES.find((o) => o.label === e.target.value);
                              setForm({ ...form, revenusFoyerLabel: opt?.label ?? "", revenusFoyerValue: opt?.value ?? 0 });
                            }}
                            className={inputCls}
                          >
                            <option value="" className="text-navy">Aucun / non concerné</option>
                            {REVENU_VALUES.map((o) => (
                              <option key={o.label} value={o.label} className="text-navy">{o.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Garant</p>
                          <select
                            value={form.garantType}
                            onChange={(e) => setForm({ ...form, garantType: e.target.value })}
                            className={inputCls}
                          >
                            <option value="" className="text-navy">Pas de garant</option>
                            <option value="Personne physique" className="text-navy">Personne physique</option>
                            <option value="Garantie Visale (Action Logement)" className="text-navy">Garantie Visale</option>
                            <option value="Assurance loyers impayés" className="text-navy">Assurance loyers impayés</option>
                            <option value="Autre" className="text-navy">Autre</option>
                          </select>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Documents disponibles</p>
                          <div className="space-y-1.5 text-sm">
                            {DOCUMENT_OPTIONS.map((doc) => (
                              <label key={doc} className="flex items-start gap-2 cursor-pointer text-white/90">
                                <input
                                  type="checkbox"
                                  checked={form.documents.includes(doc)}
                                  onChange={() => toggleDoc(doc)}
                                  className="mt-0.5 accent-[var(--color-gold)]"
                                />
                                <span>{doc}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Date d'entrée souhaitée</p>
                          <input
                            type="date"
                            value={form.entryDate}
                            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-1">
                      <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
                        {listing.isRental ? "Type de demande" : "Je souhaite"}
                      </p>
                      <div className="space-y-2">
                        {(listing.isRental
                          ? [
                              { val: "visite" as SaleIntent, label: "Organiser une visite" },
                              { val: "infos" as SaleIntent, label: "Obtenir plus d'informations" },
                              { val: "offre" as SaleIntent, label: "Déposer ma candidature" },
                            ]
                          : (Object.keys(SALE_INTENT_LABEL) as SaleIntent[]).map((val) => ({ val, label: SALE_INTENT_LABEL[val] }))
                        ).map((it) => (
                          <label key={it.val} className="flex items-center gap-2.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="intent"
                              checked={form.intent === it.val}
                              onChange={() => setForm({ ...form, intent: it.val })}
                              className="accent-[var(--color-gold)]"
                            />
                            <span className="text-white/90">{it.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {form.intent === "visite" && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className={inputCls}>
                          <option value="">Jour préféré</option>
                          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((d) => (
                            <option key={d} value={d} className="text-navy">{d}</option>
                          ))}
                        </select>
                        <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} className={inputCls}>
                          <option value="">Créneau</option>
                          {["9h-11h", "11h-13h", "14h-16h", "16h-18h"].map((s) => (
                            <option key={s} value={s} className="text-navy">{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <textarea
                      placeholder={listing.isRental ? "Présentation rapide (optionnel)" : "Questions particulières sur ce bien ?"}
                      rows={3}
                      maxLength={1000}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputCls} resize-none`}
                    />

                    <label className="flex items-start gap-2 text-xs text-white/70 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        required
                        checked={form.rgpd}
                        onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
                        className="mt-0.5 accent-[var(--color-gold)]"
                      />
                      <span>
                        J'accepte que mes informations soient utilisées pour traiter ma demande (RGPD).
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={!form.rgpd || !emailValid}
                      className="w-full px-5 py-3.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listing.isRental ? "Envoyer mon pré-dossier" : "Envoyer ma demande"}
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <section className="mt-24">
              <h2 className="font-display text-3xl text-navy mb-2">Biens similaires</h2>
              <p className="text-foreground/70 mb-8">Vous aimerez aussi</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Retour aux annonces
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
