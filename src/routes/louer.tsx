import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ListingCatalog } from "@/components/site/ListingCatalog";
import { ProfileForm } from "@/components/site/ProfileForm";

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

function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash === "#profil") {
        const el = document.getElementById("profil");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.focus({ preventScroll: true });
        }
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
}

function RentPage() {
  useHashScroll();
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs items={[{ label: "Louer" }]} />
      <main className="pt-6">
        <section className="max-w-5xl mx-auto px-6 lg:px-10 mb-10">
          <ProfileForm defaultType="location" />
        </section>
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
