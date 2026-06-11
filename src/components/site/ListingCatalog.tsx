import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LISTINGS, type Listing } from "@/lib/listings";
import { ListingCard } from "@/components/site/ListingCard";

type TypeFilter = "vente" | "location" | "all";
type SortMode = "newest" | "price-asc" | "price-desc";
type AvailabilityFilter = "all" | "immediate" | "this-month" | "within-3-months";

type Props = {
  initialType?: TypeFilter;
  title: string;
  subtitle: string;
};

export function ListingCatalog({ initialType = "all", title, subtitle }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>(initialType);
  const [sort, setSort] = useState<SortMode>("newest");
  const [visible, setVisible] = useState(9);
  const [rentalBudget, setRentalBudget] = useState(1500);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = LISTINGS.filter((l) => {
      if (type === "vente" && l.isRental) return false;
      if (type === "location" && !l.isRental) return false;
      if (q) {
        const hay = `${l.title} ${l.neighborhood} ${l.description} ${l.reference}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (type === "location") {
        if (l.price > rentalBudget) return false;
        if (furnishedOnly && !l.furnished) return false;
        if (availability !== "all" && l.availabilityTag !== availability) return false;
      }
      return true;
    });

    if (sort === "price-asc") res = [...res].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") res = [...res].sort((a, b) => b.price - a.price);
    return res;
  }, [availability, furnishedOnly, query, rentalBudget, sort, type]);

  const shown = filtered.slice(0, visible);
  const saleCount = LISTINGS.filter((l) => !l.isRental).length;
  const rentalCount = LISTINGS.filter((l) => l.isRental).length;

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-4">
        <div className="text-center mb-8">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Sélection Dupuis Immobilier
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-3">{title}</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </section>

      <div className="sticky top-16 sm:top-20 z-30 bg-white border-y border-border shadow-[0_4px_18px_-12px_rgba(27,45,79,0.18)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,2fr)_repeat(3,minmax(0,1fr))] gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ville, quartier, référence..."
                className="w-full min-h-[48px] pl-10 pr-3 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
              />
            </div>

            <select
              className="min-h-[48px] px-3 py-3 rounded-lg border border-border bg-white text-navy text-sm font-medium focus:outline-none focus:border-gold"
              value={type}
              onChange={(e) => {
                setType(e.target.value as TypeFilter);
                setVisible(9);
              }}
            >
              <option value="vente">À vendre ({saleCount})</option>
              <option value="location">À louer ({rentalCount})</option>
              <option value="all">Toutes ({LISTINGS.length})</option>
            </select>

            <select
              className="min-h-[48px] px-3 py-3 rounded-lg border border-border bg-white text-navy text-sm font-medium focus:outline-none focus:border-gold"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>

            <div className="min-h-[48px] px-4 py-3 rounded-lg bg-cream text-sm text-navy flex items-center justify-center font-medium">
              {filtered.length} bien{filtered.length > 1 ? "s" : ""}
            </div>
          </div>

          {type === "location" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="rounded-lg border border-border bg-white px-4 py-3">
                <span className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">Budget loyer max</span>
                <input
                  type="range"
                  min={400}
                  max={1500}
                  step={50}
                  value={rentalBudget}
                  onChange={(e) => setRentalBudget(Number(e.target.value))}
                  className="w-full accent-[var(--color-rental)]"
                />
                <span className="text-sm font-medium text-navy">Jusqu'à {rentalBudget} €/mois</span>
              </label>

              <label className="rounded-lg border border-border bg-white px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-foreground/60 mb-1">Meublé uniquement</span>
                  <span className="text-sm text-navy">Afficher seulement les logements meublés</span>
                </div>
                <input
                  type="checkbox"
                  checked={furnishedOnly}
                  onChange={(e) => setFurnishedOnly(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-rental)]"
                />
              </label>

              <label className="rounded-lg border border-border bg-white px-4 py-3">
                <span className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">Disponibilité</span>
                <select
                  className="w-full text-sm text-navy bg-white focus:outline-none"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
                >
                  <option value="all">Peu importe</option>
                  <option value="immediate">Immédiatement</option>
                  <option value="this-month">Ce mois</option>
                  <option value="within-3-months">Dans 3 mois</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-10 pb-24">
        {shown.length === 0 ? (
          <div className="bg-cream rounded-xl p-12 text-center">
            <p className="text-navy font-display text-xl mb-2">Aucun bien ne correspond</p>
            <p className="text-foreground/70">Essayez d'élargir vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {shown.map((listing: Listing) => (
              <ListingCard key={listing.id} listing={listing} />
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
    </>
  );
}
