export const CRM_STAGES = ["nouveau", "a_qualifier", "en_cours", "rdv", "clos"] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export const STAGE_LABELS: Record<CrmStage, string> = {
  nouveau: "Nouveau",
  a_qualifier: "À qualifier",
  en_cours: "En cours",
  rdv: "RDV / Visite",
  clos: "Clos",
};

export const DEMO_BLOCKED = "Action simulée ou indisponible en mode démonstration";

export type CrmLead = {
  id: string;
  created_at: string;
  form_type: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  reference_annonce: string | null;
  donnees_completes: Record<string, string | number | boolean | null | string[]>;
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
