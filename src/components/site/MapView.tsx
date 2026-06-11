import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Listing } from "@/lib/listings";
import { LISTING_COORDS } from "@/lib/listings-extra";

type Props = {
  listings: Listing[];
};

function priceForPin(l: Listing): string {
  if (l.isRental) return `${Math.round(l.price)}€`;
  if (l.price >= 1000) return `${Math.round(l.price / 1000)}K€`;
  return `${l.price}€`;
}

function pinColor(l: Listing): string {
  if (l.status.includes("exclusivite")) return "#C9A96E";
  if (l.isRental) return "#16A34A";
  return "#1B2D4F";
}

function popupHtml(l: Listing): string {
  const photo = l.photos[0];
  const beds = l.bedrooms !== null ? ` · ${l.bedrooms} ch.` : "";
  return `
    <div style="display:flex;gap:10px;width:240px;font-family:inherit;">
      <img src="${photo}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:#1b2d4f;font-weight:600;line-height:1.2;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${l.title}</div>
        <div style="font-size:13px;color:#1b2d4f;font-weight:700;">${l.priceLabel}</div>
        <div style="font-size:11px;color:#6b7280;">${l.surface} m²${beds}</div>
        <a href="/annonces/${l.id}" style="display:inline-block;margin-top:4px;font-size:11px;color:#c9a96e;font-weight:600;text-decoration:none;">Voir le détail →</a>
      </div>
    </div>`;
}

const POI: Record<string, { label: string; emoji: string; lat: number; lng: number }> = {
  gare: { label: "Gare de Reims", emoji: "🚉", lat: 49.2611, lng: 4.0314 },
  chu: { label: "CHU de Reims", emoji: "🏥", lat: 49.2456, lng: 4.0589 },
  univ: { label: "Université Reims", emoji: "🎓", lat: 49.2378, lng: 4.0756 },
  centre: { label: "Centre-ville", emoji: "🏛️", lat: 49.2583, lng: 4.0317 },
};

// Fallback radii in meters (no API key needed)
const FALLBACK_RADIUS: Record<"foot" | "car", Record<number, number>> = {
  foot: { 5: 400, 10: 800, 15: 1200, 20: 1600, 30: 2400 },
  car: { 5: 2000, 10: 4000, 15: 6000, 20: 8000, 30: 12000 },
};

type IsoState = {
  poi: keyof typeof POI;
  mode: "foot" | "car";
  minutes: number;
};

const LS_KEY = "di_isochrone_v1";

// Compute haversine distance in meters
function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function clusterIcon(L: any) {
  return (cluster: any) => {
    const count = cluster.getChildCount();
    let size = 36;
    let bg = "#1B2D4F";
    let extraClass = "";
    if (count >= 10) {
      size = 52;
      bg = "#C9A96E";
      extraClass = " di-cluster-pulse-lg";
    } else if (count >= 5) {
      size = 44;
      extraClass = " di-cluster-pulse";
    }
    return L.divIcon({
      html: `<div class="di-cluster${extraClass}" style="width:${size}px;height:${size}px;background:${bg};color:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${
        count >= 10 ? 18 : count >= 5 ? 16 : 14
      }px;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.25);">${count}</div>`,
      className: "di-cluster-wrap",
      iconSize: [size, size],
    });
  };
}

export function MapView({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const isoLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [iso, setIso] = useState<IsoState | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [counter, setCounter] = useState<{ total: number; filteredLabel?: string }>({ total: listings.length });

  const signature = useMemo(() => listings.map((l) => l.id).join(","), [listings]);

  // Restore saved iso once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IsoState;
        if (parsed && POI[parsed.poi]) setIso(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined" || !containerRef.current) return;
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      await import("leaflet.markercluster");
      if (cancelled || !containerRef.current) return;
      const L: any = (leaflet as any).default ?? leaflet;
      LRef.current = L;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: [49.2583, 4.0317],
          zoom: 13,
          scrollWheelZoom: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(mapRef.current);
        clusterRef.current = (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 14,
          maxClusterRadius: (zoom: number) => {
            if (zoom <= 11) return 200;
            if (zoom === 12) return 120;
            if (zoom === 13) return 80;
            return 0;
          },
          iconCreateFunction: clusterIcon(L),
        });
        mapRef.current.addLayer(clusterRef.current);
        setTimeout(() => mapRef.current?.invalidateSize(), 50);
      }
      renderPins();
      renderIso();
    }

    function renderPins() {
      const L = LRef.current;
      if (!L || !clusterRef.current) return;
      clusterRef.current.clearLayers();
      markersRef.current.clear();
      const center = iso ? POI[iso.poi] : null;
      const radius = iso ? FALLBACK_RADIUS[iso.mode][iso.minutes] : 0;
      let inZone = 0;
      listings.forEach((l) => {
        const coords = LISTING_COORDS[l.id];
        if (!coords) return;
        const color = pinColor(l);
        const label = priceForPin(l);
        const isInside = !iso || distanceM(coords, center!) <= radius;
        if (isInside) inZone++;
        const opacity = iso && !isInside ? 0.3 : 1;
        const icon = L.divIcon({
          className: "di-pin",
          html: `<div style="background:${color};color:#fff;border-radius:9999px;padding:6px 10px;font-weight:700;font-size:11px;box-shadow:0 4px 10px rgba(0,0,0,0.25);white-space:nowrap;border:2px solid #fff;opacity:${opacity};${
            iso && !isInside ? "filter:grayscale(0.6);pointer-events:none;" : ""
          }">${label}</div>`,
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });
        const m = L.marker([coords.lat, coords.lng], { icon, interactive: isInside });
        if (isInside) m.bindPopup(popupHtml(l), { maxWidth: 280 });
        markersRef.current.set(l.id, m);
        clusterRef.current.addLayer(m);
      });
      if (iso) {
        setCounter({
          total: listings.length,
          filteredLabel: `${inZone} bien${inZone > 1 ? "s" : ""} à ${iso.minutes} min ${iso.mode === "foot" ? "à pied" : "en voiture"} de ${POI[iso.poi].label}`,
        });
      } else {
        setCounter({ total: listings.length });
      }
      mapRef.current?.invalidateSize();
    }

    function renderIso() {
      const L = LRef.current;
      if (!L || !mapRef.current) return;
      if (isoLayerRef.current) {
        mapRef.current.removeLayer(isoLayerRef.current);
        isoLayerRef.current = null;
      }
      if (!iso) return;
      const center = POI[iso.poi];
      const radius = FALLBACK_RADIUS[iso.mode][iso.minutes];
      isoLayerRef.current = L.circle([center.lat, center.lng], {
        radius,
        color: "#3B82F6",
        weight: 2,
        opacity: 0.6,
        fillColor: "#3B82F6",
        fillOpacity: 0.15,
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(isoLayerRef.current.getBounds(), { padding: [40, 40], maxZoom: 14 });
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [signature, listings, iso]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  function applyIso(next: IsoState | null) {
    setIso(next);
    if (next) localStorage.setItem(LS_KEY, JSON.stringify(next));
    else localStorage.removeItem(LS_KEY);
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-border"
        style={{ height: "70vh", minHeight: 520 }}
      />

      {/* Counter badge */}
      <div className="pointer-events-none absolute top-3 right-3 z-[400] bg-white rounded-lg shadow-card px-3 py-2 text-xs text-navy font-semibold">
        {counter.filteredLabel ? (
          <span>📍 {counter.filteredLabel}</span>
        ) : (
          <span>{counter.total} bien{counter.total > 1 ? "s" : ""} affiché{counter.total > 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Isochrone panel — desktop top-left, mobile bottom-left FAB */}
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="absolute z-[400] top-3 left-3 hidden md:inline-flex items-center gap-2 bg-white rounded-lg shadow-card px-3 py-2 text-xs text-navy font-semibold hover:bg-cream"
      >
        📍 Temps de trajet
      </button>
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="absolute z-[400] bottom-4 left-4 md:hidden bg-navy text-white rounded-full shadow-card px-4 py-3 text-sm font-semibold"
      >
        📍 Zone de trajet
      </button>

      {panelOpen && (
        <IsochronePanel
          current={iso}
          onClose={() => setPanelOpen(false)}
          onApply={(next) => {
            applyIso(next);
            setPanelOpen(false);
          }}
          onClear={() => {
            applyIso(null);
            setPanelOpen(false);
          }}
        />
      )}

      <style>{`
        @keyframes diClusterPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(27,45,79,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(27,45,79,0); }
        }
        @keyframes diClusterPulseLg {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.5); }
          50% { box-shadow: 0 0 0 14px rgba(201,169,110,0); }
        }
        .di-cluster-pulse { animation: diClusterPulse 2s infinite; }
        .di-cluster-pulse-lg { animation: diClusterPulseLg 2s infinite; }
      `}</style>
    </div>
  );
}

function IsochronePanel({
  current,
  onApply,
  onClear,
  onClose,
}: {
  current: IsoState | null;
  onApply: (s: IsoState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [poi, setPoi] = useState<keyof typeof POI>(current?.poi ?? "gare");
  const [mode, setMode] = useState<"foot" | "car">(current?.mode ?? "foot");
  const [minutes, setMinutes] = useState<number>(current?.minutes ?? 10);

  return (
    <div className="absolute z-[500] top-14 left-3 md:top-14 md:left-3 right-3 md:right-auto md:w-80 bg-white rounded-xl shadow-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-navy text-base">📍 Temps de trajet</p>
        <button onClick={onClose} className="text-foreground/60 hover:text-navy text-xl leading-none" aria-label="Fermer">
          ×
        </button>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-foreground/60 mb-1">Point de départ</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {(Object.keys(POI) as (keyof typeof POI)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPoi(key)}
            className={`text-xs px-2.5 py-2 rounded-lg border ${
              poi === key ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-gold"
            }`}
          >
            {POI[key].emoji} {POI[key].label}
          </button>
        ))}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-foreground/60 mb-1">Mode</p>
      <div className="flex gap-1.5 mb-3">
        {([
          ["foot", "🚶 Pied"],
          ["car", "🚗 Voiture"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex-1 text-xs px-2.5 py-2 rounded-lg border ${
              mode === key ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-gold"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-foreground/60 mb-1">Durée</p>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {[5, 10, 15, 20, 30].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={`text-xs px-2 py-2 rounded-lg border ${
              minutes === m ? "bg-gold text-navy border-gold font-semibold" : "bg-white text-navy border-border hover:border-gold"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onApply({ poi, mode, minutes })}
          className="flex-1 px-3 py-2.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-gold hover:text-navy transition-colors"
        >
          Afficher la zone
        </button>
        {current && (
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2.5 rounded-lg border border-border text-xs text-navy hover:bg-cream"
          >
            Effacer
          </button>
        )}
      </div>
      <p className="text-[10px] text-foreground/50 mt-3 leading-tight">
        Estimation basée sur un rayon de trajet moyen (sans API).
      </p>
    </div>
  );
}
