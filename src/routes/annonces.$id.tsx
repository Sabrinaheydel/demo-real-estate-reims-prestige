import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { Listing } from "@/lib/listings";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Lightbox } from "@/components/site/Lightbox";
import { ListingCard } from "@/components/site/ListingCard";
import { getListing, getSimilar, getListingReference, getDpe } from "@/lib/listings";
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

type Intent = "visite" | "infos" | "offre" | "rappel";

const INTENT_LABEL: Record<Intent, string> = {
  visite: "Organiser une visite",
  infos: "Obtenir plus d'informations",
  offre: "Faire une offre",
  rappel: "Être rappelé(e)",
};

function ListingDetailPage() {
  const { listing } = Route.useLoaderData() as { listing: Listing };
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const similar = getSimilar(listing);
  const reference = getListingReference(listing.id);
  const dpe = getDpe(listing.id);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    intent: "visite" as Intent,
    day: "",
    slot: "",
    message: "",
    rgpd: false,
  });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const statusLabel: Record<string, string> = {
    vente: "À vendre",
    location: "À louer",
    exclusivite: "Exclusivité",
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid || !form.rgpd) return;

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const intentLabel = INTENT_LABEL[form.intent];
    const subject = `🏠 Nouvelle demande — Réf. ${reference} — ${fullName} — ${intentLabel}`;
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

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
                {listing.status.map((s) => (
                  <span
                    key={s}
                    className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                      s === "exclusivite"
                        ? "bg-gold text-navy"
                        : s === "location"
                          ? "bg-emerald-600 text-white"
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
              <div className="font-display text-4xl sm:text-5xl text-navy mb-8">{listing.priceLabel}</div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                {[
                  { icon: Maximize, label: "Surface", value: `${listing.surface} m²` },
                  listing.rooms !== null && { icon: HomeIcon, label: "Pièces", value: `${listing.rooms}` },
                  listing.bedrooms !== null && { icon: Bed, label: "Chambres", value: `${listing.bedrooms}` },
                  { icon: Car, label: "Parking", value: listing.parking ? "Oui" : "Non" },
                  { icon: Building2, label: "Étage", value: "—" },
                  { icon: Package, label: "Cave", value: listing.features.some((f) => f.toLowerCase().includes("cave")) ? "Oui" : "—" },
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
                  Vous êtes intéressé(e) ?
                </h3>
                <p className="text-gold text-xs font-semibold tracking-wider mb-6">
                  Réf. {reference}
                </p>
                {sent ? (
                  <div className="bg-gold/15 border border-gold/40 rounded-lg p-5 text-center">
                    <Check size={28} className="mx-auto text-gold mb-3" />
                    <p className="text-white font-semibold mb-2">
                      ✅ Votre demande a été envoyée !
                    </p>
                    <p className="text-white/80 text-sm">
                      Julien Dupuis vous recontacte sous 24h pour la Réf. {reference}.
                      Un email de confirmation vous a été envoyé.
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

                    <div className="pt-1">
                      <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Je souhaite</p>
                      <div className="space-y-2">
                        {(Object.keys(INTENT_LABEL) as Intent[]).map((val) => (
                          <label key={val} className="flex items-center gap-2.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="intent"
                              checked={form.intent === val}
                              onChange={() => setForm({ ...form, intent: val })}
                              className="accent-[var(--color-gold)]"
                            />
                            <span className="text-white/90">{INTENT_LABEL[val]}</span>
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
                      placeholder="Questions particulières sur ce bien ?"
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
                        J'accepte que mes informations soient utilisées pour me recontacter au sujet de cette annonce (RGPD).
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={!form.rgpd || !emailValid}
                      className="w-full px-5 py-3.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Envoyer ma demande
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
