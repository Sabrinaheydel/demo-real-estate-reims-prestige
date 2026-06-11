import { useEffect, useState } from "react";
import { LISTINGS, type Listing } from "@/lib/listings";

export const ADMIN_LISTINGS_KEY = "admin-listings";

function readStored(): Listing[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_LISTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Listing[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getEffectiveListings(): Listing[] {
  return readStored() ?? LISTINGS;
}

export function useListings(): Listing[] {
  const [list, setList] = useState<Listing[]>(LISTINGS);
  useEffect(() => {
    const sync = () => setList(readStored() ?? LISTINGS);
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_LISTINGS_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return list;
}

export function useListing(id: string): Listing | undefined {
  const all = useListings();
  return all.find((l) => l.id === id);
}
