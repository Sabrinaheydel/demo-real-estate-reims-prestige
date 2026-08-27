import { useState } from "react";
import { track } from "@/lib/analytics";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  {
    title: "1 · Lire les indicateurs",
    body: "En haut : leads ouverts, leads à qualifier, RDV/visites planifiés et dossiers clos. Ces compteurs se mettent à jour à chaque action.",
  },
  {
    title: "2 · Ouvrir un lead",
    body: "Cliquez sur une carte du pipeline pour ouvrir la fiche prospect : coordonnées, demande, historique.",
  },
  {
    title: "3 · Qualifier le prospect",
    body: "Dans la fiche, renseignez un score (0-100), un responsable et la prochaine action. La sauvegarde est immédiate.",
  },
  {
    title: "4 · Faire avancer le pipeline",
    body: "Changez l'étape depuis la carte ou la fiche : Nouveau → À qualifier → En cours → RDV/Visite → Clos.",
  },
  {
    title: "5 · Planifier une visite",
    body: "Section RDV / Visites : choisissez date, heure et type, puis cliquez sur Planifier. Le compteur RDV augmente.",
  },
  {
    title: "6 · Associer un bien",
    body: "Section Biens matchés : sélectionnez un bien du portefeuille et associez-le au prospect avec son score de matching.",
  },
];

export default function DemoGuide({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];

  function next() {
    track("guided_step_completed", { step: i + 1 });
    if (i === STEPS.length - 1) {
      onClose();
      return;
    }
    setI(i + 1);
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:w-96 z-[60] bg-white rounded-xl border border-navy/20 shadow-card p-4">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">Démo guidée · 6 étapes</p>
        <button onClick={onClose} aria-label="Quitter la démo guidée" className="p-1 rounded hover:bg-navy/10">
          <X size={16} />
        </button>
      </div>
      <h4 className="font-display text-lg text-navy">{step.title}</h4>
      <p className="text-sm text-foreground/70 mt-1">{step.body}</p>
      <div className="h-1.5 rounded-full bg-navy/10 mt-3">
        <div
          className="h-1.5 rounded-full bg-gold transition-all"
          style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Précédent
        </button>
        <span className="text-xs text-foreground/50">
          {i + 1}/{STEPS.length}
        </span>
        <button
          onClick={next}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-navy text-white"
        >
          {i === STEPS.length - 1 ? "Terminer" : "Suivant"} <ChevronRight size={14} />
        </button>
      </div>
      <p className="text-[11px] text-foreground/50 mt-2">
        Agence, agents, annonces et prospects sont entièrement fictifs.
      </p>
    </div>
  );
}
