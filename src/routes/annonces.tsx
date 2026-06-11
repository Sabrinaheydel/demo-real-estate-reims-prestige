import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ListingCard } from "@/components/site/ListingCard";
import { LISTINGS, getListingReference, type Listing } from "@/lib/listings";
import { Search, SlidersHorizontal, X, MapPin, Maximize, Bed, Car, Home as HomeIcon } from "lucide-react";

export const Route = createFileRoute("/annonces")({
  head: () => ({
    meta: [
      { title: "Nos biens disponibles · Dupuis Immobilier Reims" },
      {
        name: "description",
        content:
          "Découvrez l'ensemble des biens à vendre et à louer à Reims sélectionnés par Dupuis Immobilier appartements, maisons, investissements.",
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

type TypeFilter = "vente" | "location" | "all";
type SortMode = "newest" | "price-asc" | "price-desc";
type PriceBucket = "all" | "lt100" | "100-200" | "200-350" | "350-500" | "gt500";
type BedFilter = "all" | "1" | "2" | "3" | "4";
type PropType = "all" | "appartement" | "maison" | "villa" | "studio" | "local";
type SurfaceMin = 0 | 50 | 70 | 90 | 120;
type Tri = "all" | "yes" | "no";

function inferPropType(title: string): Exclude<PropType, "all"> {
  const t = title.toLowerCase();
  if (t.includes("villa")) return "villa";
  if (t.includes("studio")) return "studio";
  if (t.includes("local") || t.includes("commercial")) return "local";
  if (t.includes("maison")) return "maison";
  return "appartement";
}

const PRICE_BUCKETS: { v: PriceBucket; label: string }[] = [
  { v: "all", label: "Tous les prix" },
  { v: "lt100", label: "Moins de 100 000 €" },
  { v: "100-200", label: "100 000 € 200 000 €" },
  { v: "200-350", label: "200 000 € 350 000 €" },
  { v: "350-500", label: "350 000 € 500 000 €" },
  { v: "gt500", label: "Plus de 500 000 €" },
];

function priceInBucket(price: number, b: PriceBucket) {
  switch (b) {
    case "all": return true;
    case "lt100": return price < 100000;
    case "100-200": return price >= 100000 && price < 200000;
    case "200-350": return price >= 200000 && price < 350000;
    case "350-500": return price >= 350000 && price < 500000;
    case "gt500": return price >= 500000;
  }
}

function DetailMiniCard({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const reference = getListingReference(listing.id);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.72)" }} onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-card overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-cream">
          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-navy flex items-center justify-center hover:bg-white"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex px-3 py-1 rounded-full bg-cream text-navy text-xs font-semibold tracking-wider uppercase">
              {listing.isRental ? "Location" : "Vente"}
            </span>
            <span className="text-sm text-gold font-semibold">Réf. {reference}</span>
          </div>

          <h2 className="font-display text-2xl text-navy mb-2">{listing.title}</h2>
          <div className="flex items-center gap-2 text-sm text-foreground/70 mb-5">
            <MapPin size={15} className="text-gold" />
            <span>{listing.neighborhood}, Reims</span>
          </div>

          <div className="font-display text-3xl text-gold mb-5">{listing.priceLabel}</div>

          <div className="flex flex-wrap gap-4 text-sm text-foreground/80 mb-5 pb-5 border-b border-border">
            <span className="flex items-center gap-1.5"><Maximize size={14} className="text-gold" /> {listing.surface} m²</span>
            {listing.rooms !== null && <span className="flex items-center gap-1.5"><HomeIcon size={14} className="text-gold" /> {listing.rooms} pièces</span>}
            {listing.bedrooms !== null && <span className="flex items-center gap-1.5"><Bed size={14} className="text-gold" /> {listing.bedrooms} ch.</span>}
            <span className="flex items-center gap-1.5"><Car size={14} className="text-gold" /> {listing.parking ? "Parking" : "Sans parking"}</span>
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6 line-clamp-4">{listing.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              search={{ reference, listing: listing.title, intent: "infos" }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors"
            >
              Demander plus d'infos
            </Link>
            <Link
              to="/contact"
              search={{ reference, listing: listing.title, intent: "visite" }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors"
            >
              Demander une visite
            </Link>
            <Link
              to="/annonces/$id"
              params={{ id: listing.id }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-border text-navy font-medium hover:border-gold hover:text-gold transition-colors"
            >
              Voir la page complète
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnoncesPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("vente");
  const [price, setPrice] = useState<PriceBucket>("all");
  const [beds, setBeds] = useState<BedFilter>("all");
  const [propType, setPropType] = useState<PropType>("all");
  const [surfaceMin, setSurfaceMin] = useState<SurfaceMin>(0);
  const [parking, setParking] = useState<Tri>("all");
  const [garden, setGarden] = useState<Tri>("all");
  const [exclusiveOnly, setExclusiveOnly] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("newest");
  const [visible, setVisible] = useState(9);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = LISTINGS.filter((l) => {
      if (type === "vente" && l.isRental) return false;
      if (type === "location" && !l.isRental) return false;
      if (!priceInBucket(l.price, price)) return false;
      if (beds !== "all" && (l.bedrooms ?? 0) < Number(beds)) return false;
      if (propType !== "all" && inferPropType(l.title) !== propType) return false;
      if (surfaceMin > 0 && l.surface < surfaceMin) return false;
      if (parking === "yes" && !l.parking) return false;
      if (parking === "no" && l.parking) return false;
      const hasGarden = l.features.some((f) => f.toLowerCase().includes("jardin"));
      if (garden === "yes" && !hasGarden) return false;
      if (garden === "no" && hasGarden) return false;
      if (exclusiveOnly && !l.status.includes("exclusivite")) return false;
      if (q) {
        const hay = `${l.title} ${l.neighborhood} ${l.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "price-asc") res = [...res].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") res = [...res].sort((a, b) => b.price - a.price);
    return res;
  }, [query, type, price, beds, propType, surfaceMin, parking, garden, exclusiveOnly, sort]);

  const shown = filtered.slice(0, visible);

  const selectClass =
    "w-full min-h-[48px] px-3 py-3 rounded-lg border border-border bg-white text-navy text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition";

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs items={[{ label: "Annonces" }]} />
      <main className="pt-6 pb-24">
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-4">
          <div className="text-center mb-8">
            <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Sélection Dupuis Immobilier
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-navy mb-3">
              Nos biens disponibles
            </h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              {LISTINGS.length} biens d'exception à Reims et alentours, sélectionnés pour vous.
            </p>
          </div>
        </section>

        <div className="sticky top-16 sm:top-20 z-30 bg-white border-y border-border shadow-[0_4px_18px_-12px_rgba(27,45,79,0.18)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_repeat(4,minmax(0,1fr))_auto] gap-2.5 sm:gap-3">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier ou adresse..."
                  className="w-full min-h-[48px] pl-10 pr-3 py-3 rounded-lg border border-border bg-white text-navy text-base sm:text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
                />
              </div>
              <select className={selectClass} value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
                <option value="vente">À vendre</option>
                <option value="location">À louer</option>
                <option value="all">Toutes les annonces</option>
              </select>
              <select className={selectClass} value={price} onChange={(e) => setPrice(e.target.value as PriceBucket)}>
                {PRICE_BUCKETS.map((b) => (
                  <option key={b.v} value={b.v}>{b.label}</option>
                ))}
              </select>
              <select className={selectClass} value={beds} onChange={(e) => setBeds(e.target.value as BedFilter)}>
                <option value="all">Chambres &amp; SdB</option>
                <option value="1">1+ chambre</option>
                <option value="2">2+ chambres</option>
                <option value="3">3+ chambres</option>
                <option value="4">4+ chambres</option>
              </select>
              <select className={selectClass} value={propType} onChange={(e) => setPropType(e.target.value as PropType)}>
                <option value="all">Tous types</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="local">Local commercial</option>
              </select>
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className="flex-1 lg:flex-none min-h-[48px] px-4 py-3 rounded-lg border border-border bg-white text-navy text-sm font-medium hover:border-gold inline-flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal size={16} /> Plus
                </button>
                <button
                  type="button"
                  onClick={() => setVisible(9)}
                  className="flex-1 lg:flex-none min-h-[48px] px-5 py-3 rounded-lg text-navy text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: "#C9A96E" }}
                >
                  <Search size={16} /> Rechercher
                </button>
              </div>
            </div>

            {moreOpen && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-1.5">Surface min</label>
                  <select className={selectClass} value={surfaceMin} onChange={(e) => setSurfaceMin(Number(e.target.value) as SurfaceMin)}>
                    <option value={0}>Toutes surfaces</option>
                    <option value={50}>50 m²+</option>
                    <option value={70}>70 m²+</option>
                    <option value={90}>90 m²+</option>
                    <option value={120}>120 m²+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-1.5">Parking</label>
                  <select className={selectClass} value={parking} onChange={(e) => setParking(e.target.value as Tri)}>
                    <option value="all">Indifférent</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-1.5">Jardin</label>
                  <select className={selectClass} value={garden} onChange={(e) => setGarden(e.target.value as Tri)}>
                    <option value="all">Indifférent</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-navy font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exclusiveOnly}
                      onChange={(e) => setExclusiveOnly(e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-gold)]"
                    />
                    Exclusivité uniquement
                  </label>
                </div>
                <div className="col-span-2 md:col-span-4 flex justify-end">
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="text-xs text-foreground/60 hover:text-navy inline-flex items-center gap-1"
                  >
                    <X size={14} /> Fermer
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-navy font-bold">
                {filtered.length} bien{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-foreground/60">Trier par</span>
                <select
                  className="px-3 py-2 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-10">
          {shown.length === 0 ? (
            <div className="bg-cream rounded-xl p-12 text-center">
              <p className="text-navy font-display text-xl mb-2">Aucun bien ne correspond</p>
              <p className="text-foreground/70">Essayez d'élargir vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {shown.map((l) => (
                <ListingCard key={l.id} listing={l} onDetailClick={setSelectedListing} />
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
      {selectedListing && <DetailMiniCard listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </div>
  );
}
