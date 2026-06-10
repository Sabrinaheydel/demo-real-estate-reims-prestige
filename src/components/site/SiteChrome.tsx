import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Accueil", href: "/" },
  { label: "Annonces", href: "/annonces" },
  { label: "Vendre", href: "/#services" },
  { label: "Louer", href: "/#services" },
  { label: "Acheter", href: "/#services" },
  { label: "Dernières ventes", href: "/#chiffres" },
  { label: "Contact", href: "/#contact" },
];

function NavItem({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export function Navbar({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);
  const isSolid = solid || scrolled;
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_-12px_rgba(27,45,79,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-20">
        <Link
          to="/"
          className={`font-display text-2xl tracking-tight transition-colors ${
            isSolid ? "text-navy" : "text-white"
          }`}
        >
          Dupuis <span className="text-gold italic">Immobilier</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <NavItem
              key={l.label}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                isSolid ? "text-navy" : "text-white/90"
              }`}
            >
              {l.label}
            </NavItem>
          ))}
        </nav>
        <a
          href="/#contact"
          className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors shadow-soft"
        >
          Estimation gratuite
        </a>
        <button
          onClick={() => setOpen(!open)}
          className={`lg:hidden p-2 ${isSolid ? "text-navy" : "text-white"}`}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-border shadow-card">
          <nav className="px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <NavItem
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-navy font-medium py-2"
              >
                {l.label}
              </NavItem>
            ))}
            <a
              href="/#contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center px-5 py-3 rounded-lg bg-gold text-navy font-semibold"
            >
              Estimation gratuite
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy text-white/80 pt-16 pb-8 px-6">
      <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-2xl text-white mb-4">
            Dupuis <span className="text-gold italic">Immobilier</span>
          </div>
          <p className="text-sm text-white/70 mb-5">
            Agent indépendant à Reims. Vente, location, investissement — un accompagnement humain et exigeant.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Facebook size={15}/></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Instagram size={15}/></a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Linkedin size={15}/></a>
          </div>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <NavItem href={l.href} className="hover:text-gold transition-colors">{l.label}</NavItem>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="text-gold shrink-0 mt-0.5"/><span>24 rue de Vesle, 51100 Reims</span></li>
            <li className="flex gap-2"><Phone size={16} className="text-gold shrink-0 mt-0.5"/><span>+33 3 26 00 00 00</span></li>
            <li className="flex gap-2"><Mail size={16} className="text-gold shrink-0 mt-0.5"/><span>contact@dupuis-immobilier.fr</span></li>
          </ul>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Informations</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="hover:text-gold transition-colors">Mentions légales</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Politique RGPD</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Honoraires</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 mt-12 pt-6 text-xs text-white/50 text-center">
        © {new Date().getFullYear()} Dupuis Immobilier · Tous droits réservés · Carte T n° CPI 5101 2024 000 000 000
      </div>
    </footer>
  );
}
