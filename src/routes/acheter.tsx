import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/SiteChrome";
import { ProfileForm } from "@/components/site/ProfileForm";
import { TextField, RadioGroup, CheckboxGroup } from "./vendre";
import { Check, Search } from "lucide-react";

export const Route = createFileRoute("/acheter")({
  head: () => ({
    meta: [
      { title: "Acheter à Reims · Dupuis Immobilier" },
      { name: "description", content: "Trouvez le bien de vos rêves à Reims. Recherche personnalisée et accompagnement sur-mesure avec Dupuis Immobilier." },
      { property: "og:title", content: "Acheter avec Dupuis Immobilier" },
      { property: "og:description", content: "Recherche personnalisée de biens à Reims." },
    ],
  }),
  component: BuyPage,
});

function BuyForm() {
  const [budget, setBudget] = useState(300000);
  const [surface, setSurface] = useState(50);
  const [rooms, setRooms] = useState(3);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-cream rounded-xl p-10 text-center">
        <Check size={36} className="mx-auto text-gold mb-3" />
        <h3 className="font-display text-2xl text-navy mb-2">Recherche enregistrée</h3>
        <p className="text-foreground/70">Vous recevrez les biens correspondants en avant-première.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="bg-white rounded-xl shadow-soft border border-border p-6 lg:p-10 space-y-6"
    >
      <RadioGroup name="type" label="Type recherché" options={["Appartement", "Maison", "Les deux"]} />

      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Budget max · <span className="text-gold font-semibold">{budget.toLocaleString("fr-FR")} €</span>
        </label>
        <input
          type="range"
          min={50000}
          max={800000}
          step={10000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-[var(--color-gold)]"
        />
        <div className="flex justify-between text-xs text-foreground/50 mt-1">
          <span>50 000 €</span>
          <span>800 000 €</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Surface min souhaitée · <span className="text-gold font-semibold">{surface} m²</span>
        </label>
        <input
          type="range"
          min={20}
          max={300}
          step={5}
          value={surface}
          onChange={(e) => setSurface(Number(e.target.value))}
          className="w-full accent-[var(--color-gold)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Nombre de pièces min · <span className="text-gold font-semibold">{rooms}</span>
        </label>
        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
          className="w-full accent-[var(--color-gold)]"
        />
      </div>

      <CheckboxGroup
        name="quartiers"
        label="Quartiers préférés"
        options={["Centre", "Clairmarais", "Jean Jaurès", "Laon", "Bezannes", "Peu importe"]}
      />
      <CheckboxGroup
        name="criteres"
        label="Critères importants"
        options={["Parking", "Jardin", "Balcon", "Cave", "Proche écoles", "Investissement locatif"]}
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <TextField name="firstname" label="Prénom" required />
        <TextField name="email" type="email" label="Email" required />
        <TextField name="phone" type="tel" label="Téléphone" required />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors shadow-card"
      >
        <Search size={18} /> Trouver mon bien
      </button>
    </form>
  );
}

function BuyPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Acheter" }]}>
      <section className="relative pt-10 pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=80)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Acheter à Reims
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-5">
            Trouvons ensemble votre futur chez-vous
          </h1>
          <p className="text-lg text-foreground/70">
            Décrivez le bien idéal et je vous présente en avant-première ce qui correspond.
          </p>
        </div>
      </section>

      <section className="pb-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <ProfileForm defaultType="achat" />
          <BuyForm />
        </div>
      </section>
    </PageShell>
  );
}
