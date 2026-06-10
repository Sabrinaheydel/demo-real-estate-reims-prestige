import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/politique-rgpd")({
  head: () => ({
    meta: [
      { title: "Politique RGPD · Dupuis Immobilier" },
      { name: "description", content: "Politique de confidentialité et de protection des données personnelles." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell breadcrumbs={[{ label: "Politique RGPD" }]}>
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl text-navy mb-8">Politique de confidentialité (RGPD)</h1>
          <div className="space-y-6 text-foreground/80 leading-relaxed">
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Responsable du traitement</h2>
              <p>Dupuis Immobilier. Julien Dupuis, 24 rue de Vesle, 51100 Reims.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Données collectées</h2>
              <p>Lors d'une demande d'estimation, de contact ou de visite, nous collectons : nom, prénom, email, téléphone, et le message libre que vous nous transmettez.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Finalités</h2>
              <p>Les données sont utilisées uniquement pour répondre à votre demande, vous accompagner sur votre projet immobilier, et exécuter le mandat le cas échéant. Aucune donnée n'est cédée à des tiers à des fins commerciales.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Durée de conservation</h2>
              <p>3 ans à compter du dernier contact, ou pendant toute la durée de la relation contractuelle, puis archivage légal conformément à la réglementation.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Vos droits</h2>
              <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition au traitement de vos données. Pour exercer ces droits : contact@dupuis-immobilier.fr.</p>
              <p className="mt-2">Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-navy mb-2">Cookies</h2>
              <p>Le site utilise des cookies essentiels au fonctionnement, ainsi que des cookies de mesure d'audience soumis à votre consentement via la bannière dédiée.</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
