import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales · Dupuis Immobilier" },
      { name: "description", content: "Mentions légales de Dupuis Immobilier, agent indépendant à Reims." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell breadcrumbs={[{ label: "Mentions légales" }]}>
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl text-navy mb-8">Mentions légales</h1>
          <div className="space-y-6 text-foreground/80 leading-relaxed">
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Éditeur du site</h2>
              <p>Dupuis Immobilier Julien Dupuis, agent immobilier indépendant.<br/>
              24 rue de Vesle, 51100 Reims<br/>
              SIRET : 000 000 000 00000 RCS Reims<br/>
              Carte professionnelle T n° CPI 5101 2026 000 000 000 délivrée par la CCI Marne en Champagne.<br/>
              Garantie financière : Galian Assurances, 89 rue La Boétie, 75008 Paris.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Directeur de la publication</h2>
              <p>Julien Dupuis</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Hébergement</h2>
              <p>Cloudflare, Inc. 101 Townsend Street, San Francisco, CA 94107, USA.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Propriété intellectuelle</h2>
              <p>L'ensemble des contenus de ce site (textes, images, logos) est protégé par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Contact</h2>
              <p>contact@dupuis-immobilier.fr +33 3 26 00 00 00</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
