import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { demoSignInFn } from "@/lib/demo-access.functions";
import { track } from "@/lib/analytics";
import { ArrowLeft, ShieldCheck, PlayCircle, Info } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo CRM immobilier · Dupuis Immobilier" },
      {
        name: "description",
        content:
          "Testez en 5 minutes un CRM immobilier complet : pipeline, qualification, visites et matching. Données entièrement simulées.",
      },
      { property: "og:title", content: "Démo CRM immobilier · Dupuis Immobilier" },
      {
        property: "og:description",
        content: "Bêta publique : pipeline, scoring, RDV et matching sur un jeu de données fictif.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const startDemo = useServerFn(demoSignInFn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function launch() {
    setBusy(true);
    setError(null);
    try {
      const { tokenHash } = await startDemo();
      const { error: err } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
      if (err) throw new Error(err.message);
      track("demo_started", { source: "demo_page" });
      window.sessionStorage.setItem("crm_guide", "1");
      window.location.href = "/admin?tab=crm&guide=1";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Démonstration indisponible");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-navy mb-6">
          <ArrowLeft size={14} /> Retour au site
        </Link>

        <span className="inline-block text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-navy/10 text-navy font-semibold mb-3">
          Bêta publique · données immobilières simulées
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-navy mb-3">Tester le CRM en démonstration</h1>
        <p className="text-foreground/70 mb-6">
          Un parcours guidé de moins de 5 minutes : lire les indicateurs, ouvrir un prospect, le qualifier, le faire
          avancer dans le pipeline, planifier une visite et associer un bien.
        </p>

        <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-card">
          <ol className="text-sm text-foreground/80 space-y-2 mb-5 list-decimal list-inside">
            <li>Comprendre les indicateurs du portefeuille</li>
            <li>Ouvrir une fiche prospect</li>
            <li>Qualifier : score et prochaine action</li>
            <li>Déplacer le prospect dans le pipeline</li>
            <li>Planifier une visite</li>
            <li>Associer un bien et voir le résultat</li>
          </ol>
          <button
            onClick={launch}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-navy text-white font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60"
          >
            <PlayCircle size={18} /> {busy ? "Ouverture de la démo…" : "Lancer la démonstration guidée"}
          </button>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          <p className="text-xs text-foreground/60 mt-3 flex items-start gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            Accès visiteur en bac à sable : aucune donnée réelle n'est visible ni modifiable, aucun email n'est envoyé.
          </p>
        </div>

        <p className="text-xs text-foreground/60 mt-6 flex items-start gap-1.5">
          <Info size={14} className="shrink-0 mt-0.5" />
          Avertissement : l'agence, les agents, les annonces, les prospects et les montants présentés dans cette
          démonstration sont fictifs et générés à des fins de présentation produit.
        </p>
      </div>
    </main>
  );
}
