import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ListingCatalog } from "@/components/site/ListingCatalog";

export const Route = createFileRoute("/louer")({
  head: () => ({
    meta: [
      { title: "Nos locations à Reims · Dupuis Immobilier" },
      { name: "description", content: "Découvrez nos 6 annonces de biens à louer à Reims avec fiches détaillées et candidature rapide." },
      { property: "og:title", content: "Biens à louer à Reims" },
      { property: "og:description", content: "Studios, appartements et maisons à louer à Reims et alentours." },
    ],
  }),
  component: RentPage,
});

function RentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs items={[{ label: "Louer" }]} />
      <main className="pt-6">
        <ListingCatalog
          initialType="location"
          title="Biens à louer"
          subtitle="6 locations sélectionnées à Reims et ses alentours, avec filtres dédiés et pages détail complètes."
        />
      </main>
      <Footer />
    </div>
  );
}
