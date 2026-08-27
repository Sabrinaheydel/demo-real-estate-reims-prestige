import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CRM_STAGES, DEMO_BLOCKED, type CrmSnapshot, type CrmLead, type CrmNote, type CrmAppointment, type CrmMatch } from "./crm.model";

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
    // Demo visitors never see real personal data: demo-only rows, and the
    // public feedback form (which can contain a real email) is excluded.
    if (demoOnly) leadsQ = leadsQ.eq("is_demo", true).neq("form_type", "feedback-demo");


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
      leads: (leads.data ?? []) as unknown as CrmSnapshot["leads"],
      notes: (notes.data ?? []) as unknown as CrmSnapshot["notes"],
      appointments: (appts.data ?? []) as unknown as CrmSnapshot["appointments"],
      matches: (matches.data ?? []) as unknown as CrmSnapshot["matches"],
      properties: (props.data ?? []) as unknown as CrmSnapshot["properties"],
    };
  });

export const updateLeadCrmFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        patch: z.object({
          crm_stage: z.enum(CRM_STAGES).optional(),
          lead_score: z.number().int().min(0).max(100).nullable().optional(),
          assigned_to: z.string().max(120).nullable().optional(),
          next_action: z.string().max(300).nullable().optional(),
          next_action_at: z.string().max(40).nullable().optional(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: any = { ...data.patch };
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

export const addCrmNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ lead_id: z.string().uuid(), content: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertLeadAccess } = await import("./crm.server");
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

export const addCrmAppointmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        lead_id: z.string().uuid(),
        scheduled_at: z.string().min(4).max(40),
        appointment_type: z.string().min(1).max(50),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertLeadAccess } = await import("./crm.server");
    const lead = await assertLeadAccess(supabaseAdmin, role, data.lead_id);
    const when = new Date(data.scheduled_at);
    if (Number.isNaN(when.getTime())) throw new Error("Date de rendez-vous invalide");
    const { data: row, error } = await supabaseAdmin
      .from("crm_appointments")
      .insert({
        lead_id: data.lead_id,
        scheduled_at: when.toISOString(),
        appointment_type: data.appointment_type,
        notes: data.notes ?? null,
        is_demo: lead.is_demo,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as CrmAppointment;
  });

export const addCrmMatchFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        lead_id: z.string().uuid(),
        property_id: z.string().uuid(),
        match_score: z.number().int().min(0).max(100).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./staff.server");
    const role = await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertLeadAccess } = await import("./crm.server");
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

export const submitDemoFeedbackFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(2000).optional(),
        email: z.string().email().max(200).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("form_submissions")
      .insert({
        form_type: "feedback-demo",
        email: data.email ? data.email : null,
        is_demo: true,
        email_status: "pending",
        statut: "nouveau",
        donnees_completes: {
          note: data.rating,
          commentaire: data.comment ?? "",
          source: "demo-crm",
        },
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    let emailStatus = "sent";
    try {
      const { sendDemoFeedbackNotification } = await import("@/lib/brevo.server");
      await sendDemoFeedbackNotification({
        rating: data.rating,
        comment: data.comment,
        testerEmail: data.email || undefined,
      });
    } catch (e) {
      emailStatus = "failed";
      console.error("[feedback] notification email failed:", e instanceof Error ? e.message : e);
    }
    if (row?.id) {
      await supabaseAdmin
        .from("form_submissions")
        .update({ email_status: emailStatus })
        .eq("id", row.id);
    }
    return { ok: true, emailStatus };
  });
