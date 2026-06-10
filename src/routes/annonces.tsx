import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { ListingCard } from "@/components/site/ListingCard";
import { LISTINGS, NEIGHBORHOODS } from "@/lib/listings";
import { SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/annonces")({
  head: () => ({
    meta: [
      { title: "Nos biens disponibles · Dupuis Immobilier Reims" },
      {
        name: "description",
        content:
          "Découvrez l'ensemble des biens à vendre et à louer à Reims sélectionnés par Dupuis Immobilier — appartements, maisons, investissements.",
      },
      { property: "og:title", content: "Nos annonces immobilières à Reims" },
      {
        property: "og:description",
        content:
          "Appartements, maisons et investissements à Reims. Sélection exclusive Dupuis Immobilier.",
      },
    ],
  }),
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="font-display text-3xl text-navy">Page introuvable</h1>
    </div>
  ),
  component: AnnoncesPage,
});

type TypeFilter = "all" | "vente" | "location";

function AnnoncesPage() {
  const [type, setType] = useState<TypeFilter>("all");
  const [budget, setBudget] = useState(600000);
  const [minSurface, setMinSurface] = useState(0);
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [visible, setVisible] = useState(9);

  const filtered = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (type === "vente" && l.isRental) return false;
      if (type === "location" && !l.isRental) return false;
      if (!l.isRental && l.price > budget) return false;
      if (l.surface < minSurface) return false;
      if (neighborhood !== "all" && !l.neighborhood.startsWith(neighborhood)) return false;
      return true;
    });
  }, [type, budget, minSurface, neighborhood]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="pt-28 pb-24">
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Sélection Dupuis Immobilier
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-navy mb-4">
              Nos biens disponibles
            </h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              {LISTINGS.length} biens d'exception à Reims et alentours, sélectionnés pour vous.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 lg:p-8 mb-10 border border-border">
            <div className="flex items-center gap-2 text-navy font-semibold mb-5">
              <SlidersHorizontal size={18} className="text-gold" />
              <span>Affiner ma recherche</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">Type</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["all", "vente", "location"] as TypeFilter[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                        type === t ? "bg-navy text-white" : "bg-white text-navy hover:bg-cream"
                      }`}
                    >
                      {t === "all" ? "Tous" : t === "vente" ? "Vente" : "Location"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">
                  Budget max · {budget.toLocaleString("fr-FR")} €
                </label>
                <input
                  type="range"
                  min={50000}
                  max={600000}
                  step={10000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-[var(--color-gold)]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">
                  Surface min · {minSurface} m²
                </label>
                <input
                  type="range"
                  min={0}
                  max={250}
                  step={10}
                  value={minSurface}
                  onChange={(e) => setMinSurface(Number(e.target.value))}
                  className="w-full accent-[var(--color-gold)]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">Quartier</label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold"
                >
                  <option value="all">Tous les quartiers</option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 text-sm text-foreground/60">
              {filtered.length} bien{filtered.length > 1 ? "s" : ""} correspond{filtered.length > 1 ? "ent" : ""} à vos critères
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="bg-cream rounded-xl p-12 text-center">
              <p className="text-navy font-display text-xl mb-2">Aucun bien ne correspond</p>
              <p className="text-foreground/70">Essayez d'élargir vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {shown.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {visible < filtered.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisible((v) => v + 6)}
                className="inline-flex items-center px-8 py-3.5 rounded-lg border-2 border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors"
              >
                Charger plus de biens
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
