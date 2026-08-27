import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CRM_STAGES,
  STAGE_LABELS,
  getCrmSnapshotFn,
  updateLeadCrmFn,
  addCrmNoteFn,
  addCrmAppointmentFn,
  addCrmMatchFn,
  type CrmSnapshot,
  type CrmStage,
  type CrmLead,
} from "@/lib/crm.functions";
import { X, CalendarClock, StickyNote, Link2, Users, Target, CheckCircle2 } from "lucide-react";

const EMPTY: CrmSnapshot = {
  role: "demo",
  leads: [],
  notes: [],
  appointments: [],
  matches: [],
  properties: [],
};

function leadName(l: CrmLead) {
  const n = `${l.prenom ?? ""} ${l.nom ?? ""}`.trim();
  return n || l.email || "Contact sans nom";
}

function demandeLabel(t: string) {
  const map: Record<string, string> = {
    "candidature-location": "Candidature location",
    "estimation-vendre": "Estimation vente",
    "contact": "Contact",
    "recherche-achat": "Recherche achat",
  };
  return map[t] ?? t.replace(/-/g, " ");
}

function scoreColor(s: number | null) {
  if (s === null) return "bg-gray-200 text-gray-600";
  if (s >= 75) return "bg-emerald-100 text-emerald-800";
  if (s >= 50) return "bg-amber-100 text-amber-800";
  return "bg-gray-200 text-gray-700";
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CrmBoard() {
  const fetchSnapshot = useServerFn(getCrmSnapshotFn);
  const updateLead = useServerFn(updateLeadCrmFn);
  const addNote = useServerFn(addCrmNoteFn);
  const addAppt = useServerFn(addCrmAppointmentFn);
  const addMatch = useServerFn(addCrmMatchFn);

  const [snap, setSnap] = useState<CrmSnapshot>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSnapshot();
      setSnap(s as CrmSnapshot);
    } catch (e) {
      console.warn("[crm] load failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchSnapshot]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const kpis = useMemo(() => {
    const l = snap.leads;
    return {
      ouverts: l.filter((x) => x.crm_stage !== "clos").length,
      aQualifier: l.filter((x) => x.crm_stage === "a_qualifier").length,
      rdv: snap.appointments.length,
      clos: l.filter((x) => x.crm_stage === "clos").length,
    };
  }, [snap]);

  const openLead = snap.leads.find((l) => l.id === openId) ?? null;

  function fail(e: unknown) {
    const msg = e instanceof Error ? e.message : "Action impossible";
    toast.error(msg);
  }

  async function setStage(lead: CrmLead, stage: CrmStage) {
    const prev = snap.leads;
    setSnap((s) => ({ ...s, leads: s.leads.map((l) => (l.id === lead.id ? { ...l, crm_stage: stage } : l)) }));
    try {
      await updateLead({ data: { id: lead.id, patch: { crm_stage: stage } } });
      toast.success(`Étape : ${STAGE_LABELS[stage]}`);
    } catch (e) {
      setSnap((s) => ({ ...s, leads: prev }));
      fail(e);
    }
  }

  async function patchLead(lead: CrmLead, patch: Partial<Pick<CrmLead, "lead_score" | "assigned_to" | "next_action" | "next_action_at">>) {
    const prev = snap.leads;
    setSnap((s) => ({ ...s, leads: s.leads.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)) }));
    try {
      await updateLead({ data: { id: lead.id, patch } });
      toast.success("Fiche mise à jour");
    } catch (e) {
      setSnap((s) => ({ ...s, leads: prev }));
      fail(e);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-border p-8 text-center text-foreground/60">Chargement du CRM…</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi icon={Users} label="Leads ouverts" value={kpis.ouverts} />
        <Kpi icon={Target} label="À qualifier" value={kpis.aQualifier} />
        <Kpi icon={CalendarClock} label="RDV / visites" value={kpis.rdv} />
        <Kpi icon={CheckCircle2} label="Clos" value={kpis.clos} />
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5 items-start">
        {CRM_STAGES.map((stage) => {
          const items = snap.leads.filter((l) => l.crm_stage === stage);
          return (
            <div key={stage} className="bg-white/70 rounded-xl border border-border p-3 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-navy">{STAGE_LABELS[stage]}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-navy/10 text-navy">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && <p className="text-xs text-foreground/40 italic py-2">Aucun lead</p>}
                {items.map((l) => {
                  const match = snap.matches.find((m) => m.lead_id === l.id);
                  const prop = match ? snap.properties.find((p) => p.id === match.property_id) : undefined;
                  return (
                    <div
                      key={l.id}
                      className="bg-white rounded-lg border border-border p-3 hover:border-gold transition-colors cursor-pointer"
                      onClick={() => setOpenId(l.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-navy truncate">{leadName(l)}</p>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${scoreColor(l.lead_score)}`}>
                          {l.lead_score ?? "—"}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground/60 mt-0.5">{demandeLabel(l.form_type)}</p>
                      {l.next_action && (
                        <p className="text-[11px] text-foreground/70 mt-1.5 truncate">➜ {l.next_action}</p>
                      )}
                      {(prop || l.reference_annonce) && (
                        <p className="text-[11px] text-gold mt-1 truncate">
                          {prop ? `${prop.reference} · ${prop.titre}` : l.reference_annonce}
                        </p>
                      )}
                      <select
                        value={l.crm_stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setStage(l, e.target.value as CrmStage)}
                        className="mt-2 w-full text-[11px] border border-border rounded px-1.5 py-1 bg-cream/50"
                      >
                        {CRM_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openLead && (
        <LeadDrawer
          lead={openLead}
          snap={snap}
          onClose={() => setOpenId(null)}
          onPatch={patchLead}
          onStage={setStage}
          onAddNote={async (content) => {
            try {
              const n = await addNote({ data: { lead_id: openLead.id, content } });
              setSnap((s) => ({ ...s, notes: [n as never, ...s.notes] }));
              toast.success("Note ajoutée");
            } catch (e) {
              fail(e);
            }
          }}
          onAddAppt={async (scheduled_at, appointment_type, notes) => {
            try {
              const a = await addAppt({ data: { lead_id: openLead.id, scheduled_at, appointment_type, notes } });
              setSnap((s) => ({ ...s, appointments: [...s.appointments, a as never] }));
              toast.success("RDV planifié");
            } catch (e) {
              fail(e);
            }
          }}
          onAddMatch={async (property_id, match_score) => {
            try {
              const m = await addMatch({ data: { lead_id: openLead.id, property_id, match_score } });
              setSnap((s) => ({
                ...s,
                matches: [m as never, ...s.matches.filter((x) => x.id !== (m as { id: string }).id)],
              }));
              toast.success("Bien associé");
            } catch (e) {
              fail(e);
            }
          }}
        />
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-foreground/60 text-xs mb-1">
        <Icon size={14} className="text-gold" /> {label}
      </div>
      <p className="font-display text-2xl text-navy">{value}</p>
    </div>
  );
}

function LeadDrawer({
  lead,
  snap,
  onClose,
  onPatch,
  onStage,
  onAddNote,
  onAddAppt,
  onAddMatch,
}: {
  lead: CrmLead;
  snap: CrmSnapshot;
  onClose: () => void;
  onPatch: (l: CrmLead, patch: Partial<Pick<CrmLead, "lead_score" | "assigned_to" | "next_action" | "next_action_at">>) => void;
  onStage: (l: CrmLead, s: CrmStage) => void;
  onAddNote: (content: string) => void;
  onAddAppt: (scheduledAt: string, type: string, notes: string | null) => void;
  onAddMatch: (propertyId: string, score: number | null) => void;
}) {
  const [note, setNote] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptType, setApptType] = useState("visite");
  const [propId, setPropId] = useState("");
  const [score, setScore] = useState(String(lead.lead_score ?? ""));
  const [assigned, setAssigned] = useState(lead.assigned_to ?? "");
  const [nextAction, setNextAction] = useState(lead.next_action ?? "");
  const [nextAt, setNextAt] = useState(lead.next_action_at ? lead.next_action_at.slice(0, 10) : "");

  const notes = snap.notes.filter((n) => n.lead_id === lead.id);
  const appts = snap.appointments.filter((a) => a.lead_id === lead.id);
  const matches = snap.matches.filter((m) => m.lead_id === lead.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full overflow-y-auto bg-cream border-l border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-navy">{leadName(lead)}</h2>
            <p className="text-xs text-foreground/60">
              {demandeLabel(lead.form_type)} · reçu le {fmtDate(lead.created_at)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded hover:bg-navy/10">
            <X size={18} />
          </button>
        </div>

        <Section title="Coordonnées">
          <p className="text-sm">{lead.email ?? "—"}</p>
          <p className="text-sm">{lead.telephone ?? "—"}</p>
          {lead.reference_annonce && <p className="text-xs text-gold mt-1">Réf. {lead.reference_annonce}</p>}
        </Section>

        <Section title="Pilotage">
          <label className="block text-xs text-foreground/60 mb-1">Étape</label>
          <select
            value={lead.crm_stage}
            onChange={(e) => onStage(lead, e.target.value as CrmStage)}
            className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white mb-3"
          >
            {CRM_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs text-foreground/60 mb-1">Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onBlur={() =>
                  onPatch(lead, { lead_score: score === "" ? null : Math.max(0, Math.min(100, Number(score))) })
                }
                className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/60 mb-1">Responsable</label>
              <input
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
                onBlur={() => onPatch(lead, { assigned_to: assigned || null })}
                className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white"
              />
            </div>
          </div>

          <label className="block text-xs text-foreground/60 mb-1">Prochaine action</label>
          <input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            onBlur={() => onPatch(lead, { next_action: nextAction || null })}
            className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white mb-2"
          />
          <input
            type="date"
            value={nextAt}
            onChange={(e) => setNextAt(e.target.value)}
            onBlur={() => onPatch(lead, { next_action_at: nextAt ? new Date(nextAt).toISOString() : null })}
            className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white"
          />
        </Section>

        <Section title="Notes" icon={StickyNote}>
          <div className="space-y-2 mb-2">
            {notes.length === 0 && <p className="text-xs text-foreground/40 italic">Aucune note</p>}
            {notes.map((n) => (
              <div key={n.id} className="bg-white rounded border border-border p-2">
                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                <p className="text-[11px] text-foreground/50 mt-1">
                  {n.created_by ?? "—"} · {fmtDateTime(n.created_at)}
                </p>
              </div>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ajouter une note…"
            className="w-full text-sm border border-border rounded px-2 py-1.5 bg-white"
          />
          <button
            onClick={() => {
              if (!note.trim()) return;
              onAddNote(note.trim());
              setNote("");
            }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-navy text-white text-sm"
          >
            Ajouter la note
          </button>
        </Section>

        <Section title="RDV / Visites" icon={CalendarClock}>
          <div className="space-y-2 mb-2">
            {appts.length === 0 && <p className="text-xs text-foreground/40 italic">Aucun rendez-vous</p>}
            {appts.map((a) => (
              <div key={a.id} className="bg-white rounded border border-border p-2 text-sm">
                <strong className="text-navy">{a.appointment_type}</strong> · {fmtDateTime(a.scheduled_at)}
                <span className="ml-2 text-[11px] text-foreground/50">{a.status}</span>
                {a.notes && <p className="text-xs text-foreground/60 mt-0.5">{a.notes}</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              value={apptDate}
              onChange={(e) => setApptDate(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1.5 bg-white"
            />
            <select
              value={apptType}
              onChange={(e) => setApptType(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1.5 bg-white"
            >
              <option value="visite">Visite</option>
              <option value="rdv-agence">RDV agence</option>
              <option value="appel">Appel</option>
              <option value="estimation">Estimation</option>
            </select>
          </div>
          <button
            onClick={() => {
              if (!apptDate) return;
              onAddAppt(apptDate, apptType, null);
              setApptDate("");
            }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-navy text-white text-sm"
          >
            Planifier
          </button>
        </Section>

        <Section title="Biens matchés" icon={Link2}>
          <div className="space-y-2 mb-2">
            {matches.length === 0 && <p className="text-xs text-foreground/40 italic">Aucun bien associé</p>}
            {matches.map((m) => {
              const p = snap.properties.find((x) => x.id === m.property_id);
              return (
                <div key={m.id} className="bg-white rounded border border-border p-2 text-sm flex items-center justify-between gap-2">
                  <span className="truncate">
                    {p ? `${p.reference} · ${p.titre}` : m.property_id}
                  </span>
                  {m.match_score !== null && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${scoreColor(m.match_score)}`}>
                      {m.match_score}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <select
              value={propId}
              onChange={(e) => setPropId(e.target.value)}
              className="flex-1 min-w-0 text-sm border border-border rounded px-2 py-1.5 bg-white"
            >
              <option value="">Choisir un bien…</option>
              {snap.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} · {p.titre}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!propId) return;
                onAddMatch(propId, lead.lead_score ?? 70);
                setPropId("");
              }}
              className="px-3 py-1.5 rounded-lg bg-navy text-white text-sm shrink-0"
            >
              Associer
            </button>
          </div>
        </Section>
      </aside>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof Users; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-gold" />} {title}
      </h3>
      {children}
    </section>
  );
}
