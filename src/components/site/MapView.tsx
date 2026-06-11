import { useEffect, useMemo, useRef } from "react";
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

export function MapView({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const signature = useMemo(() => listings.map((l) => l.id).join(","), [listings]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined" || !containerRef.current) return;
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;
      const L = leaflet.default ?? leaflet;
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
        layerRef.current = L.layerGroup().addTo(mapRef.current);
        setTimeout(() => mapRef.current?.invalidateSize(), 50);
      }
      renderPins();
    }
    function renderPins() {
      const L = LRef.current;
      if (!L || !layerRef.current) return;
      layerRef.current.clearLayers();
      listings.forEach((l) => {
        const coords = LISTING_COORDS[l.id];
        if (!coords) return;
        const color = pinColor(l);
        const label = priceForPin(l);
        const icon = L.divIcon({
          className: "di-pin",
          html: `<div style="background:${color};color:#fff;border-radius:9999px;padding:6px 10px;font-weight:700;font-size:11px;box-shadow:0 4px 10px rgba(0,0,0,0.25);white-space:nowrap;border:2px solid #fff;">${label}</div>`,
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });
        const m = L.marker([coords.lat, coords.lng], { icon });
        m.bindPopup(popupHtml(l), { maxWidth: 280 });
        layerRef.current.addLayer(m);
      });
      mapRef.current?.invalidateSize();
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [signature, listings]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-border"
      style={{ height: "70vh", minHeight: 520 }}
    />
  );
}
