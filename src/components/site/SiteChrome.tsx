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
  MessageCircle,
} from "lucide-react";

const NAV_LINKS: { label: string; to: string }[] = [
  { label: "Accueil", to: "/" },
  { label: "Annonces", to: "/annonces" },
  { label: "Vendre", to: "/vendre" },
  { label: "Louer", to: "/louer" },
  { label: "Acheter", to: "/acheter" },
  { label: "Dernières ventes", to: "/dernieres-ventes" },
  { label: "Contact", to: "/contact" },
];

const PHONE_DISPLAY = "+33 3 26 00 00 00";
const PHONE_TEL = "+33326000000";
const WHATSAPP_URL = "https://wa.me/33600000000";

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
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                isSolid ? "text-navy" : "text-white/90"
              }`}
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/vendre"
          className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors shadow-soft"
        >
          Estimation gratuite
        </Link>
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
          <nav className="px-6 py-6 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-navy font-medium py-2"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/vendre"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center px-5 py-3 rounded-lg bg-gold text-navy font-semibold"
            >
              Estimation gratuite
            </Link>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-lg border border-navy text-navy font-medium"
            >
              <Phone size={16} /> Appeler
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
            <a href="https://facebook.com/dupuisimmobilierreims" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Facebook size={15}/></a>
            <a href="https://instagram.com/dupuis.immobilier" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Instagram size={15}/></a>
            <a href="https://linkedin.com/in/julien-dupuis-immobilier" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Linkedin size={15}/></a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><MapPin size={15}/></a>
          </div>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-gold transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="text-gold shrink-0 mt-0.5"/><span>24 rue de Vesle, 51100 Reims</span></li>
            <li className="flex gap-2"><Phone size={16} className="text-gold shrink-0 mt-0.5"/><a href={`tel:${PHONE_TEL}`} className="hover:text-gold transition-colors">{PHONE_DISPLAY}</a></li>
            <li className="flex gap-2"><Mail size={16} className="text-gold shrink-0 mt-0.5"/><a href="mailto:contact@dupuis-immobilier.fr" className="hover:text-gold transition-colors">contact@dupuis-immobilier.fr</a></li>
          </ul>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Informations</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/mentions-legales" className="hover:text-gold transition-colors">Mentions légales</Link></li>
            <li><Link to="/politique-rgpd" className="hover:text-gold transition-colors">Politique RGPD</Link></li>
            <li><Link to="/honoraires" className="hover:text-gold transition-colors">Honoraires</Link></li>
            <li><Link to="/admin" className="hover:text-gold transition-colors">Espace admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-white/50 text-center">
        <div>© {new Date().getFullYear()} Dupuis Immobilier · Tous droits réservés · Carte T n° CPI 5101 2026 000 000 000</div>
        <div>
          Site réalisé par{" "}
          <a
            href="https://www.agence360digital.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            Sabrina Heydel — Agence 360 Digital
          </a>
        </div>
      </div>
      <WhatsAppBubble />
      <CookieBanner />
    </footer>
  );
}

export function WhatsAppBubble() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-card flex items-center justify-center transition-all hover:-translate-y-0.5"
    >
      <MessageCircle size={26} />
    </a>
  );
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("cookie-consent")) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);
  const save = (consent: "accepted" | "refused" | "custom") => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ consent, prefs: consent === "accepted" ? { analytics: true, marketing: true } : consent === "refused" ? { analytics: false, marketing: false } : prefs, date: new Date().toISOString() })
    );
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-5 sm:right-auto sm:max-w-md z-50 bg-white border border-border shadow-card rounded-xl p-5">
      <h3 className="font-display text-lg text-navy mb-1">Vos préférences cookies</h3>
      <p className="text-sm text-foreground/80 mb-3">
        Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser nos contenus. Vous pouvez accepter, refuser ou paramétrer vos choix.
      </p>
      {settings && (
        <div className="mb-3 space-y-2 border-t border-border pt-3">
          <label className="flex items-center justify-between gap-3 text-sm text-navy">
            <span><strong>Essentiels</strong> — requis</span>
            <input type="checkbox" checked disabled className="w-4 h-4 accent-[#C9A96E]" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-navy cursor-pointer">
            <span><strong>Analyse</strong> — mesure d'audience</span>
            <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} className="w-4 h-4 accent-[#C9A96E]" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-navy cursor-pointer">
            <span><strong>Marketing</strong> — publicités ciblées</span>
            <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} className="w-4 h-4 accent-[#C9A96E]" />
          </label>
        </div>
      )}
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={() => save("refused")} className="px-4 py-2 text-sm text-foreground/70 hover:text-navy">
          Refuser
        </button>
        {settings ? (
          <button onClick={() => save("custom")} className="px-4 py-2 text-sm rounded-lg border border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors">
            Enregistrer mes choix
          </button>
        ) : (
          <button onClick={() => setSettings(true)} className="px-4 py-2 text-sm rounded-lg border border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors">
            Paramétrer
          </button>
        )}
        <button onClick={() => save("accepted")} className="px-4 py-2 text-sm rounded-lg text-navy font-semibold hover:opacity-90" style={{ backgroundColor: "#C9A96E" }}>
          Accepter
        </button>
      </div>
    </div>
  );
}

import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";

export function PageShell({
  children,
  solidNav = true,
  breadcrumbs,
}: {
  children: React.ReactNode;
  solidNav?: boolean;
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar solid={solidNav} />
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppBubble />
      <CookieBanner />
    </div>
  );
}
