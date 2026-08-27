import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Database } from "lucide-react";
import { createSimulationLeadFn } from "@/lib/simulation.functions";
import { track } from "@/lib/analytics";

type Props = {
  calculator: "loan" | "rent";
  /** Changes whenever a significant parameter changes → re-enables the CTA. */
  signature: string;
  leadScore: number;
  details: Record<string, string | number | boolean | null>;
};

export function SimulationToCrm({ calculator, signature, leadScore, details }: Props) {
  const create = useServerFn(createSimulationLeadFn);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    setState("idle");
  }, [signature]);

  return (
    <div className="rounded-xl bg-white border border-border p-5">
      {state === "done" ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Simulation ajoutée au CRM de démonstration
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90"
          >
            Voir dans le CRM
          </Link>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={state === "loading"}
            onClick={async () => {
              setState("loading");
              try {
                await create({ data: { calculator, leadScore, details } });
                track("calculator_lead_created", { calculator });
                setState("done");
              } catch {
                setState("error");
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60"
          >
            <Database size={18} />
            {state === "loading" ? "Ajout en cours…" : "Ajouter cette simulation au CRM de démonstration"}
          </button>
          <p className="text-[11px] text-foreground/50 mt-2">
            Aucune donnée personnelle n'est enregistrée : seuls les paramètres du calcul sont transmis au CRM de
            démonstration.
          </p>
          {state === "error" && (
            <p className="text-sm text-red-600 mt-2">Ajout impossible pour le moment. Merci de réessayer.</p>
          )}
        </>
      )}
    </div>
  );
}
