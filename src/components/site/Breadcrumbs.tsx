import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Accueil", to: "/" }, ...items];
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 sm:pt-28"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-foreground/60">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight size={14} className="text-foreground/40 shrink-0" aria-hidden />
              )}
              {last || !c.to ? (
                <span
                  aria-current={last ? "page" : undefined}
                  style={{ color: "#C9A96E" }}
                  className="font-medium"
                >
                  {c.label}
                </span>
              ) : (
                <Link
                  to={c.to}
                  className="text-foreground/60 hover:text-navy hover:underline transition-colors"
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
