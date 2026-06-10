import { Link } from "@tanstack/react-router";
import { Maximize, Home as HomeIcon, Bed, Car, MapPin } from "lucide-react";
import type { Listing } from "@/lib/listings";

function StatusBadges({ statuses }: { statuses: Listing["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    vente: { label: "À vendre", cls: "bg-navy text-white" },
    location: { label: "À louer", cls: "bg-emerald-600 text-white" },
    exclusivite: { label: "Exclusivité", cls: "bg-gold text-navy" },
  };
  return (
    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
      {statuses.map((s) => (
        <span
          key={s}
          className={`${map[s].cls} text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-soft`}
        >
          {map[s].label}
        </span>
      ))}
    </div>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={listing.photos[0]}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <StatusBadges statuses={listing.status} />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="font-display text-2xl text-navy mb-2">
          {listing.priceLabel}
        </div>
        <h3 className="font-display text-lg text-navy leading-snug mb-3 line-clamp-2 min-h-[3.5rem]">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-foreground/70 mb-4">
          <MapPin size={14} className="text-gold shrink-0" />
          <span className="truncate">{listing.neighborhood}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground/80 mb-5 pb-5 border-b border-border">
          <span className="flex items-center gap-1.5">
            <Maximize size={14} className="text-gold" /> {listing.surface} m²
          </span>
          {listing.rooms !== null && (
            <span className="flex items-center gap-1.5">
              <HomeIcon size={14} className="text-gold" /> {listing.rooms} {listing.rooms > 1 ? "pièces" : "pièce"}
            </span>
          )}
          {listing.bedrooms !== null && (
            <span className="flex items-center gap-1.5">
              <Bed size={14} className="text-gold" /> {listing.bedrooms} ch.
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Car size={14} className="text-gold" />
            {listing.parking ? "Parking" : "Sans parking"}
          </span>
        </div>
        <Link
          to="/annonces/$id"
          params={{ id: listing.id }}
          className="mt-auto inline-flex items-center justify-center px-5 py-3 rounded-lg bg-navy text-white font-semibold text-sm hover:bg-gold hover:text-navy transition-colors"
        >
          Voir le détail
        </Link>
      </div>
    </article>
  );
}
