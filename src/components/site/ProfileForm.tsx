import { useEffect, useState } from "react";
import { Check, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { loadProfile, saveProfile, clearProfile, REVENU_OPTIONS, type Profile } from "@/lib/profile";
import { createProfileLeadFn } from "@/lib/profile.functions";
import { track } from "@/lib/analytics";

type Props = { defaultType?: "location" | "achat" };

const PRO_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance / Indépendant",
  etudiant: "Étudiant",
  retraite: "Retraité",
  autre: "Autre",
};

export function ProfileForm({ defaultType = "location" }: Props) {
  const createLead = useServerFn(createProfileLeadFn);
  const [form, setForm] = useState<Omit<Profile, "updatedAt">>({
    situation_pro: "",
    revenus_mensuels: 0,
    revenus_label: "",
    garant: "",
    type_recherche: defaultType,
  });
  const [saved, setSaved] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crmDone, setCrmDone] = useState(false);
  /** Signature of the profile already pushed to the demo CRM (anti-duplicate). */
  const [sentSignature, setSentSignature] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setForm({
        situation_pro: p.situation_pro,
        revenus_mensuels: p.revenus_mensuels,
        revenus_label: p.revenus_label,
        garant: p.garant,
        type_recherche: p.type_recherche || defaultType,
      });
      setHasExisting(true);
    }
  }, [defaultType]);

  const signature = `${form.situation_pro}|${form.revenus_label}|${form.garant}|${form.type_recherche}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(form);
    setHasExisting(true);
    setSaved(true);

    if (sentSignature === signature || !form.garant || !form.type_recherche) return;
    setLoading(true);
    try {
      await createLead({
        data: {
          situation_pro: PRO_LABELS[form.situation_pro] ?? form.situation_pro,
          revenus_label: form.revenus_label,
          garant: form.garant,
          type_recherche: form.type_recherche,
        },
      });
      track("candidate_profile_lead_created", {});
      setSentSignature(signature);
      setCrmDone(true);
    } catch {
      /* le profil local reste enregistré même si le CRM démo est indisponible */
    } finally {
      setLoading(false);
    }
  }


  return (
    <div id="profil" tabIndex={-1} aria-labelledby="profil-heading" className="bg-white rounded-xl border border-border shadow-soft p-6 lg:p-8 scroll-mt-28 outline-none focus-visible:ring-2 focus-visible:ring-gold/50">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-rental-soft text-rental flex items-center justify-center">
          <User size={20} />
        </div>
        <div>
          <h3 id="profil-heading" className="font-display text-2xl text-navy">Mon profil candidat</h3>
          <p className="text-sm text-foreground/70">
            Renseignez votre profil pour voir les biens compatibles avec vos revenus.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm">
          <span className="block text-navy font-medium mb-1.5">Situation professionnelle</span>
          <select
            value={form.situation_pro}
            onChange={(e) => setForm({ ...form, situation_pro: e.target.value as Profile["situation_pro"] })}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border text-navy bg-white focus:outline-none focus:border-gold"
          >
            <option value="">Sélectionner...</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="freelance">Freelance / Indépendant</option>
            <option value="etudiant">Étudiant</option>
            <option value="retraite">Retraité</option>
            <option value="autre">Autre</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-navy font-medium mb-1.5">Revenus mensuels nets</span>
          <select
            value={form.revenus_label}
            onChange={(e) => {
              const opt = REVENU_OPTIONS.find((o) => o.label === e.target.value);
              setForm({
                ...form,
                revenus_label: opt?.label ?? "",
                revenus_mensuels: opt?.value ?? 0,
              });
            }}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border text-navy bg-white focus:outline-none focus:border-gold"
          >
            <option value="">Sélectionner...</option>
            {REVENU_OPTIONS.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-navy font-medium mb-1.5">Garant disponible ?</span>
          <select
            value={form.garant}
            onChange={(e) => setForm({ ...form, garant: e.target.value as Profile["garant"] })}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border text-navy bg-white focus:outline-none focus:border-gold"
          >
            <option value="">Sélectionner...</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-navy font-medium mb-1.5">Je recherche</span>
          <select
            value={form.type_recherche}
            onChange={(e) => setForm({ ...form, type_recherche: e.target.value as Profile["type_recherche"] })}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border text-navy bg-white focus:outline-none focus:border-gold"
          >
            <option value="location">Une location</option>
            <option value="achat">Un achat</option>
          </select>
        </label>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-rental text-white font-semibold hover:bg-rental/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Enregistrement…" : hasExisting ? "Mettre à jour mon profil" : "Enregistrer mon profil"}
          </button>
          {hasExisting && (
            <button
              type="button"
              onClick={() => {
                clearProfile();
                setForm({ situation_pro: "", revenus_mensuels: 0, revenus_label: "", garant: "", type_recherche: defaultType });
                setHasExisting(false);
                setSaved(false);
                setCrmDone(false);
                setSentSignature(null);
              }}
              className="text-sm text-foreground/60 hover:text-navy underline"
            >
              Effacer
            </button>
          )}
          {saved && !loading && (
            <span className="inline-flex items-center gap-1.5 text-sm text-rental">
              <Check size={16} /> {crmDone ? "Profil enregistré et ajouté au CRM de démonstration" : "Profil enregistré"}
            </span>
          )}
          {crmDone && (
            <Link
              to="/demo"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90"
            >
              Voir dans le CRM
            </Link>
          )}
          <span className="text-xs text-foreground/50 ml-auto">
            Données stockées localement, conservées 30 jours. Cette démo ne collecte ni nom, ni e-mail, ni téléphone.
          </span>
        </div>

      </form>
    </div>
  );
}
