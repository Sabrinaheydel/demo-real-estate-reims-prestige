import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const CRM_STAGES = ["nouveau", "a_qualifier", "en_cours", "rdv", "clos"] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export const STAGE_LABELS: Record<CrmStage, string> = {
  nouveau: "Nouveau",
  a_qualifier: "À qualifier",
  en_cours: "En cours",
  rdv: "RDV / Visite",
  clos: "Clos",
};

export type CrmLead = {
  id: string;
  created_at: string;
  form_type: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  reference_annonce: string | null;
  donnees_completes: Record<string, unknown>;
  statut: string;
  traite: boolean;
  is_demo: boolean;
  crm_stage: CrmStage;
  lead_score: number | null;
  assigned_to: string | null;
  next_action: string | null;
  next_action_at: string | null;
};

export type CrmNote = {
  id: string;
  lead_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

export type CrmAppointment = {
  id: string;
  lead_id: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
  notes: string | null;
};

export type CrmMatch = {
  id: string;
  lead_id: string;
  property_id: string;
  match_score: number | null;
  status: string;
};

export type CrmProperty = {
  id: string;
  reference: string;
  titre: string;
  prix: number;
  quartier: string | null;
  type: string;
};

export type CrmSnapshot = {
  role: "admin" | "demo";
  leads: CrmLead[];
  notes: CrmNote[];
  appointments: CrmAppointment[];
  matches: CrmMatch[];
  properties: CrmProperty[];
};

export const DEMO_BLOCKED = "Action simulée ou indisponible en mode démonstration";

export const getCrmSnapshotFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CrmSnapshot> => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const demoOnly = role === "demo";

    let leadsQ = supabaseAdmin
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (demoOnly) leadsQ = leadsQ.eq("is_demo", true);

    let notesQ = supabaseAdmin.from("crm_notes").select("*").order("created_at", { ascending: false });
    let apptQ = supabaseAdmin.from("crm_appointments").select("*").order("scheduled_at", { ascending: true });
    let matchQ = supabaseAdmin.from("crm_matches").select("*").order("created_at", { ascending: false });
    let propQ = supabaseAdmin
      .from("properties")
      .select("id, reference, titre, prix, quartier, type")
      .order("created_at", { ascending: false });
    if (demoOnly) {
      notesQ = notesQ.eq("is_demo", true);
      apptQ = apptQ.eq("is_demo", true);
      matchQ = matchQ.eq("is_demo", true);
      propQ = propQ.eq("is_demo", true);
    }

    const [leads, notes, appts, matches, props] = await Promise.all([leadsQ, notesQ, apptQ, matchQ, propQ]);
    for (const r of [leads, notes, appts, matches, props]) {
      if (r.error) throw new Error(r.error.message);
    }
    return {
      role,
      leads: (leads.data ?? []) as unknown as CrmLead[],
      notes: (notes.data ?? []) as unknown as CrmNote[],
      appointments: (appts.data ?? []) as unknown as CrmAppointment[],
      matches: (matches.data ?? []) as unknown as CrmMatch[],
      properties: (props.data ?? []) as unknown as CrmProperty[],
    };
  });

const UpdateLeadSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    crm_stage: z.enum(CRM_STAGES).optional(),
    lead_score: z.number().int().min(0).max(100).nullable().optional(),
    assigned_to: z.string().max(120).nullable().optional(),
    next_action: z.string().max(300).nullable().optional(),
    next_action_at: z.string().max(40).nullable().optional(),
  }),
});

export const updateLeadCrmFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateLeadSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { ...data.patch };
    // Keep legacy columns in sync with the pipeline.
    if (data.patch.crm_stage) {
      patch.traite = data.patch.crm_stage === "clos";
      patch.statut = data.patch.crm_stage === "clos" ? "traite" : "nouveau";
    }
    let q = supabaseAdmin.from("form_submissions").update(patch).eq("id", data.id);
    if (role === "demo") q = q.eq("is_demo", true);
    const { data: rows, error } = await q.select("*");
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error(DEMO_BLOCKED);
    return rows[0] as unknown as CrmLead;
  });

/** Returns the lead if the caller's role may act on it, else throws. */
async function assertLeadAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  role: "admin" | "demo",
  leadId: string,
): Promise<{ is_demo: boolean }> {
  const { data, error } = await supabaseAdmin
    .from("form_submissions")
    .select("id, is_demo")
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Lead introuvable");
  if (role === "demo" && data.is_demo !== true) throw new Error(DEMO_BLOCKED);
  return data as { is_demo: boolean };
}

const NoteSchema = z.object({ lead_id: z.string().uuid(), content: z.string().min(1).max(4000) });

export const addCrmNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NoteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const lead = await assertLeadAccess(supabaseAdmin, role, data.lead_id);
    const { data: row, error } = await supabaseAdmin
      .from("crm_notes")
      .insert({
        lead_id: data.lead_id,
        content: data.content,
        created_by: role === "demo" ? "Visiteur démo" : "Julien Dupuis",
        is_demo: lead.is_demo,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as CrmNote;
  });

const ApptSchema = z.object({
  lead_id: z.string().uuid(),
  scheduled_at: z.string().min(4).max(40),
  appointment_type: z.string().min(1).max(50),
  notes: z.string().max(2000).nullable().optional(),
});

export const addCrmAppointmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApptSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const lead = await assertLeadAccess(supabaseAdmin, role, data.lead_id);
    const { data: row, error } = await supabaseAdmin
      .from("crm_appointments")
      .insert({
        lead_id: data.lead_id,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        appointment_type: data.appointment_type,
        notes: data.notes ?? null,
        is_demo: lead.is_demo,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as CrmAppointment;
  });

const MatchSchema = z.object({
  lead_id: z.string().uuid(),
  property_id: z.string().uuid(),
  match_score: z.number().int().min(0).max(100).nullable().optional(),
});

export const addCrmMatchFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MatchSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const lead = await assertLeadAccess(supabaseAdmin, role, data.lead_id);
    const { data: prop, error: propErr } = await supabaseAdmin
      .from("properties")
      .select("id, is_demo")
      .eq("id", data.property_id)
      .maybeSingle();
    if (propErr) throw new Error(propErr.message);
    if (!prop) throw new Error("Bien introuvable");
    if (role === "demo" && prop.is_demo !== true) throw new Error(DEMO_BLOCKED);
    const { data: row, error } = await supabaseAdmin
      .from("crm_matches")
      .upsert(
        {
          lead_id: data.lead_id,
          property_id: data.property_id,
          match_score: data.match_score ?? null,
          is_demo: lead.is_demo && prop.is_demo,
        },
        { onConflict: "lead_id,property_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as CrmMatch;
  });
