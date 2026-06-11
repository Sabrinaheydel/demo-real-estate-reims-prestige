import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ListingCatalog } from "@/components/site/ListingCatalog";
import { LISTINGS } from "@/lib/listings";

type TypeSearch = "vente" | "location" | "all";

export const Route = createFileRoute("/annonces")({
  validateSearch: (search: Record<string, unknown>): { type?: TypeSearch } => {
    const t = search.type;
    if (t === "vente" || t === "location" || t === "all") return { type: t };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Nos biens disponibles · Dupuis Immobilier Reims" },
      {
        name: "description",
        content:
          "Découvrez l'ensemble des biens à vendre et à louer à Reims sélectionnés par Dupuis Immobilier.",
      },
      { property: "og:title", content: "Nos annonces immobilières à Reims" },
      {
        property: "og:description",
        content: "16 biens à vendre et à louer à Reims et ses alentours.",
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
  component: AnnoncesPage,
});

function AnnoncesPage() {
  const { type } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs items={[{ label: "Annonces" }]} />
      <main className="pt-6">
        <ListingCatalog
          initialType={type ?? "all"}
          title="Nos biens disponibles"
          subtitle={`${LISTINGS.length} biens à Reims et alentours, à vendre comme à louer.`}
        />
      </main>
      <Footer />
    </div>
  );
}
