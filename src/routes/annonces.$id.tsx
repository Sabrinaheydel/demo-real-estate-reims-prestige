import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { Listing } from "@/lib/listings";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ListingCard } from "@/components/site/ListingCard";
import { getListing, getSimilar } from "@/lib/listings";
import {
  ArrowLeft,
  MapPin,
  Maximize,
  Home as HomeIcon,
  Bed,
  Car,
  Check,
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

function ListingDetailPage() {
  const { listing } = Route.useLoaderData() as { listing: Listing };
  const [activePhoto, setActivePhoto] = useState(0);
  const [sent, setSent] = useState(false);
  const [intent, setIntent] = useState<"visite" | "infos" | "offre">("visite");
  const similar = getSimilar(listing);

  const statusLabel: Record<string, string> = {
    vente: "À vendre",
    location: "À louer",
    exclusivite: "Exclusivité",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="pt-24 pb-24">
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <Link
            to="/annonces"
            className="inline-flex items-center gap-2 text-sm text-navy hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Retour aux annonces
          </Link>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mb-10">
            <div className="rounded-xl overflow-hidden bg-cream aspect-[4/3]">
              <img
                src={listing.photos[activePhoto]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {listing.photos.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`rounded-xl overflow-hidden bg-cream aspect-[4/3] border-2 transition-all ${
                    activePhoto === i ? "border-gold" : "border-transparent hover:border-gold/40"
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

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
              <div className="font-display text-4xl text-gold mb-8">{listing.priceLabel}</div>

              <div className="bg-white border border-border rounded-xl overflow-hidden mb-10">
                <h2 className="font-display text-xl text-navy px-6 py-4 border-b border-border bg-cream/50">
                  Caractéristiques
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: "Surface", value: `${listing.surface} m²`, icon: Maximize },
                      listing.rooms !== null && {
                        label: "Pièces",
                        value: `${listing.rooms}`,
                        icon: HomeIcon,
                      },
                      listing.bedrooms !== null && {
                        label: "Chambres",
                        value: `${listing.bedrooms}`,
                        icon: Bed,
                      },
                      {
                        label: "Parking",
                        value: listing.parking ? "Oui" : "Non",
                        icon: Car,
                      },
                      { label: "Quartier", value: listing.neighborhood, icon: MapPin },
                    ]
                      .filter(Boolean)
                      .map((row) => {
                        const r = row as { label: string; value: string; icon: typeof Maximize };
                        const Icon = r.icon;
                        return (
                          <tr key={r.label} className="border-b border-border last:border-0">
                            <td className="px-6 py-3.5 text-foreground/60 w-1/2 flex items-center gap-2">
                              <Icon size={14} className="text-gold" /> {r.label}
                            </td>
                            <td className="px-6 py-3.5 text-navy font-medium">{r.value}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

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

              <div className="mb-10">
                <h2 className="font-display text-2xl text-navy mb-4">Localisation</h2>
                <div className="rounded-xl overflow-hidden border border-border bg-cream aspect-[16/8] relative">
                  <iframe
                    title="Localisation du bien"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(listing.neighborhood + ", Reims, France")}&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-2">
                  Adresse précise communiquée sur demande.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-navy text-white rounded-xl p-7 shadow-card">
                <h3 className="font-display text-2xl text-white mb-2">
                  Je suis intéressé(e) par ce bien
                </h3>
                <p className="text-white/70 text-sm mb-6">
                  Réponse personnalisée sous 24h ouvrées.
                </p>
                {sent ? (
                  <div className="bg-gold/15 border border-gold/40 rounded-lg p-5 text-center">
                    <Check size={28} className="mx-auto text-gold mb-2" />
                    <p className="text-white font-semibold mb-1">Demande envoyée</p>
                    <p className="text-white/70 text-sm">Je reviens vers vous très vite.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Prénom"
                        maxLength={60}
                        className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm"
                      />
                      <input
                        required
                        placeholder="Nom"
                        maxLength={60}
                        className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm"
                      />
                    </div>
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      maxLength={120}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm"
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Téléphone"
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm"
                    />
                    <div className="pt-1">
                      <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Je souhaite</p>
                      <div className="space-y-2">
                        {([
                          ["visite", "Visiter le bien"],
                          ["infos", "Obtenir plus d'infos"],
                          ["offre", "Faire une offre"],
                        ] as const).map(([val, label]) => (
                          <label key={val} className="flex items-center gap-2.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="intent"
                              checked={intent === val}
                              onChange={() => setIntent(val)}
                              className="accent-[var(--color-gold)]"
                            />
                            <span className="text-white/90">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Votre message (optionnel)"
                      rows={3}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold text-sm resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full px-5 py-3.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors"
                    >
                      Envoyer ma demande
                    </button>
                    <p className="text-[11px] text-white/50 text-center">
                      En envoyant ce formulaire, vous acceptez d'être recontacté.
                    </p>
                  </form>
                )}
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <section className="mt-24">
              <h2 className="font-display text-3xl text-navy mb-2">Vous aimerez aussi</h2>
              <p className="text-foreground/70 mb-8">Des biens similaires à découvrir</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
