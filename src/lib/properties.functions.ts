import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Listing, ListingStatus, PropertyType, DpeGrade } from "@/lib/listings";

export type PropertyRow = {
  id: string;
  legacy_id: string | null;
  reference: string;
  titre: string;
  type: string;
  statut: string;
  prix: number;
  surface: number | null;
  pieces: number | null;
  chambres: number | null;
  quartier: string | null;
  description: string | null;
  meuble: boolean | null;
  parking: boolean | null;
  cave: boolean | null;
  dpe: string | null;
  photo_principale: string | null;
  meta: Record<string, unknown>;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

function buildPriceLabel(prix: number, isRental: boolean, fallback?: string | null) {
  if (fallback) return fallback;
  return isRental
    ? `${prix.toLocaleString("fr-FR")} €/mois`
    : `${prix.toLocaleString("fr-FR")} €`;
}

export function rowToListing(row: PropertyRow): Listing {
  const meta = (row.meta ?? {}) as Record<string, unknown>;
  const isRental = row.type === "location";
  const status = (Array.isArray(meta.status) ? meta.status : isRental ? ["location"] : ["vente"]) as ListingStatus[];
  return {
    id: row.legacy_id ?? row.id,
    reference: row.reference,
    status,
    price: Number(row.prix),
    priceLabel: buildPriceLabel(Number(row.prix), isRental, meta.priceLabel as string | undefined),
    priceNote: (meta.priceNote as string | undefined) ?? undefined,
    isRental,
    title: row.titre,
    propertyType: ((meta.propertyType as PropertyType) ?? "appartement") as PropertyType,
    surface: Number(row.surface ?? 0),
    rooms: row.pieces,
    bedrooms: row.chambres,
    parking: !!row.parking,
    floor: (meta.floor as string | null | undefined) ?? null,
    cellar: !!row.cave,
    furnished: row.meuble ?? (meta.furnished as boolean | undefined) ?? false,
    availableFrom: meta.availableFrom as string | undefined,
    availabilityTag: meta.availabilityTag as Listing["availabilityTag"],
    rentExcludingCharges: meta.rentExcludingCharges as number | undefined,
    estimatedCharges: meta.estimatedCharges as number | undefined,
    deposit: meta.deposit as number | undefined,
    tenantFees: meta.tenantFees as number | undefined,
    animalsAccepted: meta.animalsAccepted as string | undefined,
    dpe: (row.dpe ?? "C") as DpeGrade,
    features: (Array.isArray(meta.features) ? (meta.features as string[]) : []),
    neighborhood: row.quartier ?? "",
    description: row.description ?? "",
    photos: (Array.isArray(meta.photos) && (meta.photos as string[]).length > 0)
      ? (meta.photos as string[])
      : (row.photo_principale ? [row.photo_principale] : []),
  };
}

export const listPropertiesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as PropertyRow[]).map(rowToListing);
});

export const getPropertyFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    // Try legacy_id first, then UUID
    const { data: row, error } = await supabase
      .from("properties")
      .select("*")
      .or(`legacy_id.eq.${data.id},id.eq.${data.id}`)
      .eq("visible", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return rowToListing(row as unknown as PropertyRow);
  });

const UpdateSchema = z.object({
  id: z.string().min(1).max(100),
  patch: z.object({
    titre: z.string().min(1).max(500).optional(),
    type: z.enum(["vente", "location"]).optional(),
    statut: z.string().min(1).max(50).optional(),
    prix: z.number().min(0).max(50_000_000).optional(),
    surface: z.number().min(0).max(100_000).nullable().optional(),
    pieces: z.number().int().min(0).max(50).nullable().optional(),
    chambres: z.number().int().min(0).max(50).nullable().optional(),
    quartier: z.string().max(255).nullable().optional(),
    description: z.string().max(10_000).optional(),
    meuble: z.boolean().optional(),
    parking: z.boolean().optional(),
    cave: z.boolean().optional(),
    dpe: z.string().max(5).nullable().optional(),
    photo_principale: z.string().max(2000).nullable().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    visible: z.boolean().optional(),
  }),
});

export const updatePropertyFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Resolve legacy_id → uuid if needed
    let uuid = data.id;
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) {
      const { data: row, error: lookupErr } = await supabaseAdmin
        .from("properties")
        .select("id")
        .eq("legacy_id", data.id)
        .maybeSingle();
      if (lookupErr) throw new Error(lookupErr.message);
      if (!row) throw new Error("Annonce introuvable");
      uuid = row.id as string;
    }
    const { data: updated, error } = await supabaseAdmin
      .from("properties")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(data.patch as any)
      .eq("id", uuid)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToListing(updated as unknown as PropertyRow);
  });
