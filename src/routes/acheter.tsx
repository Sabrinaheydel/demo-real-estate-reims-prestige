import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/site/SiteChrome";
import { ProfileForm } from "@/components/site/ProfileForm";
import { TextField, RadioGroup, CheckboxGroup } from "./vendre";
import { Check, Search } from "lucide-react";
import { submitBrevoForm } from "@/lib/brevo.functions";

export const Route = createFileRoute("/acheter")({
  head: () => ({
    meta: [
      { title: "Acheter à Reims · Dupuis Immobilier" },
      { name: "description", content: "Trouvez votre bien idéal à Reims. Accompagnement personnalisé de la recherche à la signature." },
      { property: "og:title", content: "Acheter à Reims · Dupuis Immobilier" },
      { property: "og:description", content: "Trouvez votre bien idéal à Reims. Accompagnement personnalisé de la recherche à la signature." },
      { name: "twitter:title", content: "Acheter à Reims · Dupuis Immobilier" },
      { name: "twitter:description", content: "Trouvez votre bien idéal à Reims. Accompagnement personnalisé de la recherche à la signature." },
    ],
  }),
  component: BuyPage,
});

function BuyForm() {
  const submit = useServerFn(submitBrevoForm);
  const [budget, setBudget] = useState(300000);
  const [surface, setSurface] = useState(50);
  const [rooms, setRooms] = useState(3);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="bg-cream rounded-xl p-10 text-center">
        <Check size={36} className="mx-auto text-gold mb-3" />
        <h3 className="font-display text-2xl text-navy mb-2">Votre demande a bien été envoyée.</h3>
        <p className="text-foreground/70">Vous recevrez les biens correspondants en avant-première.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) return;
        const data = new FormData(e.currentTarget);
        const get = (k: string) => String(data.get(k) ?? "").trim();
        const getAll = (k: string) => data.getAll(k).map((v) => String(v).trim()).filter(Boolean);
        const firstName = get("firstname");
        const lastName = get("lastname");
        const email = get("email");
        const phone = get("phone");
        const type = get("type");
        const quartiers = getAll("quartiers");
        const criteres = getAll("criteres");
        const alerte = Boolean(data.get("alerte"));
        const messageParts = [
          `Pièces min : ${rooms}`,
          criteres.length ? `Critères : ${criteres.join(", ")}` : null,
        ].filter(Boolean) as string[];

        setLoading(true);
        setError(null);
        try {
          await submit({
            data: {
              formType: "recherche-achat",
              prenom: firstName,
              nom: lastName,
              email,
              telephone: phone,
              typeBien: type || undefined,
              budget: `${budget} €`,
              surface: `${surface} m² min`,
              quartier: quartiers.join(", ") || undefined,
              message: messageParts.join(" · "),
              alerteBien: alerte,
            },
          });
          setSent(true);
        } catch (err) {
          console.error("[recherche-achat] submit failed", err);
          setError("Une erreur est survenue. Merci de réessayer ou de nous contacter directement.");
        } finally {
          setLoading(false);
        }
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

      <TextField name="firstname" label="Prénom" required />
      <div className="grid sm:grid-cols-3 gap-4">
        <TextField name="lastname" label="Nom" />
        <TextField name="email" type="email" label="Email" required />
        <TextField name="phone" type="tel" label="Téléphone" required />
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
        <input type="checkbox" name="alerte" className="mt-1 accent-[var(--color-gold)]" />
        <span>Recevoir une alerte dès qu'un bien correspondant à mes critères est mis en ligne.</span>
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Search size={18} /> {loading ? "Envoi en cours…" : "Trouver mon bien"}
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
