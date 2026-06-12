import { Link } from "@tanstack/react-router";
import { Maximize, Home as HomeIcon, Bed, Car, MapPin } from "lucide-react";
import { type Listing } from "@/lib/listings";
import { computeCompat } from "@/lib/profile";
import { useProfile } from "@/hooks/useProfile";

type ListingCardProps = {
  listing: Listing;
};

function StatusBadges({ listing }: { listing: Listing }) {
  const badges = listing.isRental
    ? [
        {
          label: "À louer",
          className: "bg-rental text-white",
        },
      ]
    : listing.status.map((status) => ({
        label:
          status === "exclusivite"
            ? "Exclusivité"
            : status === "vente"
              ? "À vendre"
              : "À louer",
        className:
          status === "exclusivite"
            ? "bg-gold text-navy"
            : status === "vente"
              ? "bg-navy text-white"
              : "bg-rental text-white",
      }));

  return (
    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
      {listing.furnished && (
        <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-soft bg-[#7C3AED] text-white">
          🛋️ Meublé
        </span>
      )}
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`${badge.className} text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-soft`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function CompatBadge({ listing }: { listing: Listing }) {
  const profile = useProfile();
  if (!listing.isRental) return null;
  const compat = computeCompat(listing.price, profile);
  const toneCls =
    compat.tone === "green"
      ? "bg-emerald-500/90 text-white"
      : compat.tone === "orange"
        ? "bg-amber-500/90 text-white"
        : compat.tone === "red"
          ? "bg-red-500/90 text-white"
          : "bg-foreground/10 text-foreground/70";
  if (compat.status === "missing") {
    return (
      <Link
        to="/annonces/$id"
        params={{ id: listing.id }}
        hash="profil"
        className="block text-center text-[12px] py-2 rounded-b-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-colors"
      >
        {compat.badge}
      </Link>
    );
  }
  return (
    <div className={`text-center text-[12px] font-medium py-2 rounded-b-xl ${toneCls}`}>
      {compat.badge}
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all hover:-translate-y-1 flex flex-col">
      <Link to="/annonces/$id" params={{ id: listing.id }} className="relative overflow-hidden aspect-[4/3] block cursor-pointer">
        <img
          src={listing.photos[0]}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <StatusBadges listing={listing} />
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="font-display text-2xl text-navy mb-1">{listing.priceLabel}</div>
        {listing.priceNote && <div className="text-xs text-foreground/50 mb-2">{listing.priceNote}</div>}
        <Link to="/annonces/$id" params={{ id: listing.id }} className="font-display text-lg text-navy leading-snug mb-3 line-clamp-2 min-h-[3.5rem] hover:text-gold transition-colors">
          {listing.title}
        </Link>
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
        <div className="mt-auto flex items-end justify-between gap-4">
          <Link
            to="/annonces/$id"
            params={{ id: listing.id }}
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-navy text-white font-semibold text-sm hover:bg-gold hover:text-navy transition-colors"
          >
            Voir le détail
          </Link>
          <span className="text-[10px] uppercase tracking-wider text-foreground/45 whitespace-nowrap">Réf. {listing.reference}</span>
        </div>
      </div>
      <CompatBadge listing={listing} />
    </article>
  );
}
