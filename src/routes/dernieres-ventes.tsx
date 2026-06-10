import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/dernieres-ventes")({
  head: () => ({
    meta: [
      { title: "Dernières ventes · Dupuis Immobilier Reims" },
      { name: "description", content: "Découvrez les biens récemment vendus par Dupuis Immobilier à Reims transparence totale sur nos résultats." },
      { property: "og:title", content: "Dernières ventes Dupuis Immobilier" },
      { property: "og:description", content: "Transparence totale sur nos résultats de ventes à Reims." },
    ],
  }),
  component: SoldPage,
});

const SOLD = [
  { title: "Appartement T3", area: "Centre-ville", days: 18, price: "215 000 €", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80" },
  { title: "Maison 5 pièces", area: "Clairmarais", days: 31, price: "389 000 €", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80" },
  { title: "Studio", area: "Hypercentre", days: 8, price: "87 000 €", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80" },
  { title: "T4 familial", area: "Laon", days: 24, price: "267 000 €", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80" },
  { title: "Villa avec jardin", area: "Bétheny", days: 42, price: "445 000 €", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80" },
  { title: "T2 investissement", area: "Vesle", days: 12, price: "112 000 €", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80" },
];

function SoldPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Dernières ventes" }]}>
      <section className="pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Nos résultats
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-4">
            Ils ont vendu avec nous les succès récents
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Transparence totale sur nos résultats
          </p>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SOLD.map((s) => (
            <article key={s.title + s.area} className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={`${s.title} vendu à ${s.area}`} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy/30" />
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-card">
                  Vendu
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-navy mb-1">{s.title}</h3>
                <p className="text-sm text-foreground/60 mb-4">{s.area}, Reims</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                    <Clock size={14} className="text-gold" /> Vendu en {s.days} jours
                  </span>
                  <span className="font-display text-lg text-navy">{s.price}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-navy text-white py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-display text-4xl text-gold mb-2">47</div>
            <div className="text-sm uppercase tracking-wider text-white/70">Biens vendus en 2026</div>
          </div>
          <div>
            <div className="font-display text-4xl text-gold mb-2">98,3%</div>
            <div className="text-sm uppercase tracking-wider text-white/70">du prix demandé en moyenne</div>
          </div>
          <div>
            <div className="font-display text-4xl text-gold mb-2">31 jours</div>
            <div className="text-sm uppercase tracking-wider text-white/70">de délai moyen</div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
