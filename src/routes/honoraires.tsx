import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/honoraires")({
  head: () => ({
    meta: [
      { title: "Honoraires · Dupuis Immobilier" },
      { name: "description", content: "Barème des honoraires Dupuis Immobilier, conforme à la loi Alur." },
    ],
  }),
  component: Page,
});

const VENTE = [
  { tranche: "Jusqu'à 100 000 €", taux: "6 % TTC" },
  { tranche: "De 100 001 € à 200 000 €", taux: "5 % TTC" },
  { tranche: "De 200 001 € à 350 000 €", taux: "4,5 % TTC" },
  { tranche: "De 350 001 € à 500 000 €", taux: "4 % TTC" },
  { tranche: "Au-delà de 500 000 €", taux: "3,5 % TTC" },
];

const LOCATION = [
  { prestation: "Visite, dossier, bail (locataire)", montant: "10 €/m² (zone non tendue)" },
  { prestation: "État des lieux d'entrée (locataire)", montant: "3 €/m²" },
  { prestation: "Honoraires bailleur (entremise & négociation)", montant: "1 mois de loyer HC TTC" },
  { prestation: "Gestion locative mensuelle", montant: "7 % TTC des loyers encaissés" },
];



function Page() {
  return (
    <PageShell breadcrumbs={[{ label: "Honoraires" }]}>
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl text-navy mb-3">Nos honoraires</h1>
          <p className="text-foreground/70 mb-10">Barème en vigueur. Conforme à la loi Alur et affiché conformément à l'arrêté du 10 janvier 2017.</p>

          <h2 className="font-display text-2xl text-navy mb-4">Vente Honoraires à la charge du vendeur</h2>
          <div className="overflow-hidden rounded-xl border border-border mb-12 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cream text-navy">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Tranche du prix de vente</th>
                  <th className="text-left px-5 py-3 font-semibold">Honoraires TTC</th>
                </tr>
              </thead>
              <tbody>
                {VENTE.map((r) => (
                  <tr key={r.tranche} className="border-t border-border">
                    <td className="px-5 py-3">{r.tranche}</td>
                    <td className="px-5 py-3 text-navy font-medium">{r.taux}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-display text-2xl text-navy mb-4">Location</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cream text-navy">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Prestation</th>
                  <th className="text-left px-5 py-3 font-semibold">Montant TTC</th>
                </tr>
              </thead>
              <tbody>
                {LOCATION.map((r) => (
                  <tr key={r.prestation} className="border-t border-border">
                    <td className="px-5 py-3">{r.prestation}</td>
                    <td className="px-5 py-3 text-navy font-medium">{r.montant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-foreground/60 mt-6">
            TVA applicable : 20 %. Honoraires donnés à titre indicatif, susceptibles d'évolution. Estimation gratuite et sans engagement.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
