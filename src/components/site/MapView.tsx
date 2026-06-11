import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "@/lib/listings";
import { LISTING_COORDS } from "@/lib/listings-extra";

type Props = {
  listings: Listing[];
  onSelect?: (id: string) => void;
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

function makePinIcon(l: Listing): L.DivIcon {
  const color = pinColor(l);
  const label = priceForPin(l);
  return L.divIcon({
    className: "di-pin",
    html: `<div style="background:${color};color:#fff;border-radius:9999px;padding:6px 10px;font-weight:700;font-size:11px;box-shadow:0 4px 10px rgba(0,0,0,0.25);white-space:nowrap;border:2px solid #fff;">${label}</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });
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
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [49.2583, 4.0317],
      zoom: 13,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // ensure correct sizing after mount
    setTimeout(() => map.invalidateSize(), 50);
  }, []);

  // signature for re-rendering pins when list changes
  const signature = useMemo(() => listings.map((l) => l.id).join(","), [listings]);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    listings.forEach((l) => {
      const coords = LISTING_COORDS[l.id];
      if (!coords) return;
      const m = L.marker([coords.lat, coords.lng], { icon: makePinIcon(l) });
      m.bindPopup(popupHtml(l), { maxWidth: 280 });
      layerRef.current!.addLayer(m);
    });
    // refresh size in case container was hidden when init ran
    mapRef.current.invalidateSize();
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
