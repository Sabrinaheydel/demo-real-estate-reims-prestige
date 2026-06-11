import { useEffect, useState, useCallback } from "react";
import { LISTINGS, type Listing } from "@/lib/listings";
import { useServerFn } from "@tanstack/react-start";
import { listPropertiesFn, getPropertyFn, updatePropertyFn } from "@/lib/properties.functions";

// Reads listings from Supabase. Falls back to the static seed during the
// initial hydration so the UI is never empty.
export function useListings(): Listing[] {
  const fetchAll = useServerFn(listPropertiesFn);
  const [list, setList] = useState<Listing[]>(LISTINGS);
  const refresh = useCallback(() => {
    fetchAll()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) setList(rows as Listing[]);
      })
      .catch(() => {
        /* keep seed fallback */
      });
  }, [fetchAll]);
  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);
  return list;
}

export function useListing(id: string): Listing | undefined {
  const fetchOne = useServerFn(getPropertyFn);
  const [listing, setListing] = useState<Listing | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    fetchOne({ data: { id } })
      .then((row) => {
        if (!cancelled && row) setListing(row as Listing);
      })
      .catch(() => {
        /* leave undefined → caller falls back to loader data */
      });
    return () => {
      cancelled = true;
    };
  }, [fetchOne, id]);
  return listing;
}

// Convert a Listing draft to the Supabase patch shape (column names).
export function listingToPatch(l: Listing) {
  return {
    titre: l.title,
    type: l.isRental ? ("location" as const) : ("vente" as const),
    statut: l.status[0] ?? (l.isRental ? "location" : "vente"),
    prix: Number(l.price) || 0,
    surface: l.surface ?? null,
    pieces: l.rooms ?? null,
    chambres: l.bedrooms ?? null,
    quartier: l.neighborhood ?? null,
    description: l.description ?? "",
    meuble: !!l.furnished,
    parking: !!l.parking,
    cave: !!l.cellar,
    dpe: l.dpe ?? null,
    photo_principale: l.photos?.[0] ?? null,
    meta: {
      status: l.status,
      propertyType: l.propertyType,
      priceLabel: l.priceLabel,
      priceNote: l.priceNote,
      floor: l.floor,
      furnished: l.furnished,
      availableFrom: l.availableFrom,
      availabilityTag: l.availabilityTag,
      rentExcludingCharges: l.rentExcludingCharges,
      estimatedCharges: l.estimatedCharges,
      deposit: l.deposit,
      tenantFees: l.tenantFees,
      animalsAccepted: l.animalsAccepted,
      features: l.features,
      photos: l.photos,
    } as Record<string, unknown>,
  };
}

export function useUpdateListing() {
  const update = useServerFn(updatePropertyFn);
  return useCallback(
    async (l: Listing) => {
      return update({ data: { id: l.id, patch: listingToPatch(l) } });
    },
    [update],
  );
}
