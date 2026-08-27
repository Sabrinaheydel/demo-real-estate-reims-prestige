import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitBrevoForm } from "@/lib/brevo.functions";
import {
  Menu,
  X,
  Home as HomeIcon,
  Clock,
  Star,
  MapPin,
  Camera,
  Megaphone,
  Users,
  Handshake,
  ClipboardCheck,
  Building2,
  Key,
  Search,
  Bed,
  Bath,
  Maximize,
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  ArrowRight,
  Check,
  PlayCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dupuis Immobilier · Agent immobilier à Reims" },
      { name: "description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
      { property: "og:title", content: "Dupuis Immobilier · Agent immobilier à Reims" },
      { property: "og:description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Dupuis Immobilier · Agent immobilier à Reims" },
      { name: "twitter:description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
    ],
  }),
  component: HomePage,
});

import heroAsset from "@/assets/hero-julien-reims.jpg.asset.json";
import portraitDesk from "@/assets/photo-profil-2.jpg.asset.json";
import haussmannienSalon from "@/assets/appartement-haussmannien-salon.png.asset.json";
import maisonCaractere from "@/assets/maison-caractere-jardin.png.asset.json";
import villaPiscine from "@/assets/villa-contemporaine-piscine.png.asset.json";
const HERO_IMG = heroAsset.url;

const NAV_LINKS = [
  { label: "Accueil", href: "#accueil" },
  { label: "Annonces", href: "/annonces" },
  { label: "Vendre", href: "#services" },
  { label: "Louer", href: "#services" },
  { label: "Acheter", href: "#services" },
  { label: "Dernières ventes", href: "#chiffres" },
  { label: "Contact", href: "#contact" },
];

const HOME_LISTINGS = [
  {
    id: "1",
    title: "Appartement haussmannien · 4 pièces",
    location: "Centre-ville, Reims",
    price: "395 000 €",
    beds: 3,
    baths: 2,
    surface: 98,
    img: haussmannienSalon.url,
  },
  {
    id: "2",
    title: "Maison de caractère avec jardin",
    location: "Cormontreuil, Reims",
    price: "562 000 €",
    beds: 4,
    baths: 2,
    surface: 165,
    img: maisonCaractere.url,
  },
  {
    id: "5",
    title: "Villa contemporaine avec piscine",
    location: "Bezannes, Reims",
    price: "520 000 €",
    beds: 5,
    baths: 3,
    surface: 220,
    img: villaPiscine.url,
  },
];

const SERVICES = [
  {
    icon: Building2,
    title: "Vendre mon bien",
    desc: "Je vous accompagne de l'estimation à la signature, avec une stratégie sur-mesure.",
    href: "/vendre",
  },
  {
    icon: Key,
    title: "Louer mon bien",
    desc: "Confiez votre bien à un professionnel. Sélection des locataires, gestion complète, loyers sécurisés.",
    href: "/louer",
  },
  {
    icon: Search,
    title: "Acheter ou investir",
    desc: "Je trouve le bien qui correspond à votre projet de vie ou patrimonial.",
    href: "/acheter",
  },
] as const;

const STEPS = [
  { icon: ClipboardCheck, title: "Estimation offerte", desc: "Sous 48 heures" },
  { icon: Camera, title: "Mise en valeur", desc: "Photos pro & description" },
  { icon: Megaphone, title: "Diffusion maximale", desc: "SeLoger, Leboncoin, réseaux" },
  { icon: Users, title: "Visites qualifiées", desc: "Feedback régulier" },
  { icon: Handshake, title: "Négociation & signature", desc: "Jusqu'au jour J" },
];

const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Vendeuse",
    quote:
      "Julien a vendu notre appartement en 3 semaines au prix demandé. Son suivi était impeccable, on se sentait vraiment accompagnés.",
  },
  {
    name: "Thomas & Claire R.",
    role: "Acheteurs",
    quote:
      "Nous cherchions depuis 6 mois. Julien a trouvé notre maison en 2 visites. Il a négocié 8 000 € en notre faveur. Incroyable.",
  },
  {
    name: "Sophie D.",
    role: "Propriétaire bailleresse",
    quote:
      "La gestion locative est parfaite. Zéro stress, tout est géré. Je recommande les yeux fermés.",
  },
  {
    name: "Michel V.",
    role: "Investisseur",
    quote:
      "3 appartements achetés avec Julien en 2 ans. Il connaît le marché rémois comme personne. Un vrai partenaire.",
  },
];

const STATS = [
  { icon: HomeIcon, value: 340, suffix: "+", label: "biens vendus" },
  { icon: Clock, value: 47, suffix: "", label: "jours · délai moyen" },
  { icon: Star, value: 4.9, suffix: "/5", label: "satisfaction clients", decimals: 1 },
  { icon: MapPin, value: 7, suffix: " ans", label: "d'expertise à Reims" },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, seen };
}

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const { ref, seen } = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);
  // Fallback: ensure final value is shown even if IntersectionObserver never fires
  useEffect(() => {
    const t = setTimeout(() => setN((cur) => (cur === 0 ? value : cur)), 2500);
    return () => clearTimeout(t);
  }, [value]);
  return <span ref={ref}>{n.toFixed(decimals)}</span>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_-12px_rgba(27,45,79,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-20">
        <a
          href="#accueil"
          className={`font-display text-2xl tracking-tight transition-colors ${
            scrolled ? "text-navy" : "text-white"
          }`}
        >
          Dupuis <span className="text-gold italic">Immobilier</span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                scrolled ? "text-navy" : "text-white/90"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition-colors shadow-soft"
        >
          Estimation gratuite
        </a>
        <button
          onClick={() => setOpen(!open)}
          className={`lg:hidden p-2 ${scrolled ? "text-navy" : "text-white"}`}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-border shadow-card">
          <nav className="px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-navy font-medium py-2"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
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

function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 639px)");
    setIsMobile(m.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  if (isMobile) {
    return (
      <section id="accueil" className="relative text-white">
        {/* BLOC 1 Photo */}
        <div className="relative h-[45vh] w-full overflow-hidden">
          <img
            src={HERO_IMG}
            alt="Julien Dupuis, agent immobilier indépendant à Reims"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "right center" }}
          />
          <div className="absolute inset-0 bg-navy/20" />
        </div>
        {/* BLOC 2 Texte */}
        <div className="bg-navy px-6 py-8">
          <span className="inline-block text-gold text-xs font-medium tracking-[0.2em] uppercase mb-4">
            Agent indépendant · Reims
          </span>
          <h1 className="!text-white font-display text-3xl leading-tight mb-4">
            Votre bien immobilier à Reims, entre de bonnes mains
          </h1>
          <p className="text-base text-white/85 mb-6">
            Estimation gratuite · Accompagnement personnalisé · Résultats prouvés
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <Link
              to="/vendre"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-all shadow-card"
            >
              Estimer mon bien
            </Link>
            <Link
              to="/annonces"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-navy transition-all"
            >
              Voir les annonces
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-all shadow-card ring-2 ring-gold/40 ring-offset-2 ring-offset-navy"
            >
              <PlayCircle size={18} className="shrink-0" />
              <span className="flex flex-col items-start leading-tight text-left">
                <span>Tester le CRM en démonstration</span>
                <span className="text-[11px] font-normal text-navy/70">Démo interactive · 5 min</span>
              </span>
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
            <Star size={16} className="fill-gold text-gold" />
            <span className="font-semibold">4,9/5</span>
            <span className="text-white/80">  160 avis Google</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="accueil" className="relative min-h-[100svh] flex items-center text-white overflow-hidden">
      <img
        src={HERO_IMG}
        alt="Julien Dupuis, agent immobilier indépendant à Reims, devant la cathédrale"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center right" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(27,45,79,0.85) 0%, rgba(27,45,79,0.7) 35%, rgba(27,45,79,0.25) 65%, rgba(27,45,79,0) 100%)",
        }}
      />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-32">
        <div className="max-w-2xl text-left">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-6">
            Agent indépendant · Reims
          </span>
          <h1 className="!text-white font-display text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Votre bien immobilier à Reims,<br className="hidden sm:block" /> entre de bonnes mains
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-10 pb-2">
            Estimation gratuite · Accompagnement personnalisé · Résultats prouvés
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/vendre"
              className="inline-flex items-center justify-center px-8 py-3 sm:py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-all hover:-translate-y-0.5 shadow-card"
            >
              Estimer mon bien
            </Link>
            <Link
              to="/annonces"
              className="inline-flex items-center justify-center px-8 py-3 sm:py-4 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-navy transition-all"
            >
              Voir les annonces
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 lg:left-10 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm text-white">
        <Star size={16} className="fill-gold text-gold" />
        <span className="font-semibold">4,9/5</span>
        <span className="text-white/80">  160 avis Google</span>
      </div>
    </section>
  );

}

function Stats() {
  return (
    <section id="chiffres" className="bg-navy py-20 px-6">
      <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-10">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="text-center text-white">
              <Icon className="mx-auto text-gold mb-4" size={36} strokeWidth={1.5} />
              <div className="font-display text-4xl lg:text-5xl text-white mb-2">
                <Counter value={s.value} decimals={s.decimals ?? 0} />
                <span className="text-gold">{s.suffix}</span>
              </div>
              <div className="text-white/70 text-sm uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">Nos services</span>
          <h2 className="text-3xl sm:text-4xl mt-3">Un accompagnement complet</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group p-10 rounded-lg bg-white border border-border hover:border-gold hover:shadow-card transition-all"
              >
                <div className="w-14 h-14 rounded-lg bg-cream flex items-center justify-center mb-6 group-hover:bg-gold/15 transition-colors">
                  <Icon className="text-navy" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground mb-6">{s.desc}</p>
                <Link to={s.href} className="inline-flex items-center gap-2 text-navy font-medium text-sm group-hover:text-gold transition-colors">
                  En savoir plus <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Listings() {
  return (
    <section id="annonces" className="py-24 px-6 bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">Sélection</span>
            <h2 className="text-3xl sm:text-4xl mt-3">Biens disponibles en ce moment</h2>
          </div>
          <Link to="/annonces" className="inline-flex items-center gap-2 text-navy font-semibold hover:text-gold transition-colors">
            Voir toutes les annonces <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOME_LISTINGS.map((l) => (
            <Link
              to="/annonces/$id"
              params={{ id: l.id }}
              key={l.id}
              className="block bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={l.img} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <MapPin size={14} className="text-gold" /> {l.location}
                </div>
                <h3 className="text-lg mb-3 leading-snug">{l.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4 mb-4">
                  <span className="inline-flex items-center gap-1"><Bed size={14}/> {l.beds}</span>
                  <span className="inline-flex items-center gap-1"><Bath size={14}/> {l.baths}</span>
                  <span className="inline-flex items-center gap-1"><Maximize size={14}/> {l.surface} m²</span>
                </div>
                <div className="font-display text-2xl text-navy">{l.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">Méthode</span>
          <h2 className="text-3xl sm:text-4xl mt-3">Vendre avec Dupuis Immobilier, étape par étape</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gold/30" />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="relative text-center">
                  <div className="relative w-16 h-16 mx-auto rounded-full bg-white border-2 border-gold flex items-center justify-center mb-5 shadow-soft">
                    <Icon className="text-navy" size={24} strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 px-6 bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">Témoignages</span>
          <h2 className="text-3xl sm:text-4xl mt-3">Ils nous ont fait confiance</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="bg-white p-8 rounded-lg shadow-soft border border-border">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="text-foreground text-lg leading-relaxed mb-6 font-display italic">
                « {t.quote} »
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-navy font-semibold text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const submit = useServerFn(submitBrevoForm);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <section
      id="contact"
      className="py-24 px-6"
      style={{ backgroundColor: "#f4ead4" }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-navy/70 text-sm font-medium tracking-[0.2em] uppercase">Contact</span>
        <h2 className="text-3xl sm:text-4xl mt-3 mb-4">Prêt à avancer sur votre projet ?</h2>
        <p className="text-foreground/80 mb-10 max-w-xl mx-auto">
          Laissez-moi vos coordonnées, je vous rappelle sous 24 heures avec un premier échange offert et sans engagement.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (loading) return;
            const data = new FormData(e.currentTarget);
            const [prenomEl, emailEl, phoneEl] = ["prenom", "email", "phone"].map((n) => String(data.get(n) ?? "").trim());
            setLoading(true);
            setError(null);
            try {
              await submit({
                data: {
                  formType: "rappel-rapide-homepage",
                  prenom: prenomEl,
                  email: emailEl,
                  telephone: phoneEl,
                  message: "Demande de rappel rapide depuis la page d'accueil.",
                },
              });
              setSent(true);
            } catch (err) {
              console.error("[rappel-rapide-homepage] submit failed", err);
              setError("Une erreur est survenue. Merci de réessayer ou de nous contacter directement.");
            } finally {
              setLoading(false);
            }
          }}
          className="bg-white rounded-lg p-6 shadow-card grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3"
        >
          <input
            required
            name="prenom"
            placeholder="Prénom"
            className="px-4 py-3 rounded-lg bg-cream border border-border focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <input
            required
            name="email"
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-cream border border-border focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <input
            required
            name="phone"
            type="tel"
            placeholder="Téléphone"
            className="px-4 py-3 rounded-lg bg-cream border border-border focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <button
            type="submit"
            disabled={loading || sent}
            className="px-6 py-3 rounded-lg bg-navy text-white font-semibold hover:bg-navy-soft transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sent ? "Merci !" : loading ? "Envoi…" : "Je veux être rappelé(e)"}
          </button>
        </form>
        {sent && (
          <p className="mt-4 text-sm text-navy/80">Votre demande a bien été envoyée.</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-navy">
          <a href="https://facebook.com/dupuisimmobilierreims" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-navy hover:text-white transition-colors"><Facebook size={18}/></a>
          <a href="https://instagram.com/dupuis.immobilier" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-navy hover:text-white transition-colors"><Instagram size={18}/></a>
          <a href="https://linkedin.com/in/julien-dupuis-immobilier" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-navy hover:text-white transition-colors"><Linkedin size={18}/></a>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-navy hover:text-white transition-colors"><MapPin size={18}/></a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy text-white/80 pt-16 pb-8 px-6">
      <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-2xl text-white mb-4">
            Dupuis <span className="text-gold italic">Immobilier</span>
          </div>
          <p className="text-sm text-white/70 mb-5">
            Agent indépendant à Reims. Vente, location, investissement un accompagnement humain et exigeant.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Facebook size={15}/></a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Instagram size={15}/></a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors"><Linkedin size={15}/></a>
          </div>
        </div>
        <div>
          <h4 className="!text-white text-sm uppercase tracking-wider mb-4 font-sans font-semibold">Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.label}><a href={l.href} className="hover:text-gold transition-colors">{l.label}</a></li>
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
        © {new Date().getFullYear()} Dupuis Immobilier · Tous droits réservés · Carte T n° CPI 5101 2026 000 000 000
      </div>
    </footer>
  );
}

import { Navbar as SiteNavbar, Footer as SiteFooter } from "@/components/site/SiteChrome";

function About() {
  return (
    <section id="a-propos" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="order-1 md:order-1">
          <img
            src={portraitDesk.url}
            alt="Julien Dupuis, agent immobilier indépendant à son bureau à Reims"
            loading="lazy"
            className="w-full h-full max-h-[600px] object-cover rounded-lg shadow-card"
            style={{ borderRadius: "8px" }}
          />
        </div>
        <div className="order-2 md:order-2">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Votre agent
          </span>
          <h2 className="font-display text-4xl text-navy mb-2">Julien Dupuis</h2>
          <p className="text-foreground/60 text-sm mb-6">Agent immobilier indépendant · Reims</p>
          <p className="text-foreground/80 leading-relaxed mb-6">
            Passionné par l'immobilier rémois depuis 7 ans, j'ai choisi l'indépendance pour vous offrir ce que les grandes agences ne peuvent pas : du temps, de l'écoute, et un engagement total sur chaque dossier. Chaque bien que je vends ou loue est traité comme si c'était le mien.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {["Carte T professionnelle", "Membre FNAIM", "RCP assurée"].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 text-sm bg-cream text-navy px-3 py-1.5 rounded-full border border-border">
                <Check size={14} className="text-gold" /> {b}
              </span>
            ))}
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 rounded-lg text-navy font-semibold hover:opacity-90 transition-opacity shadow-soft"
            style={{ backgroundColor: "#C9A96E" }}
          >
            Prendre contact
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Listings />
        <Process />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
