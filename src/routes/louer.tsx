import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  FileText,
  Wallet,
  Check,
  Building2,
  Home as HomeIcon,
  Store,
  Trees,
  ShieldCheck,
  Award,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { Navbar, Footer } from "@/components/site/SiteChrome";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RentSimulator } from "@/components/site/RentSimulator";
import portraitJulien from "@/assets/photo-profil-1.jpg.asset.json";

export const Route = createFileRoute("/louer")({
  head: () => ({
    meta: [
      { title: "Gestion locative à Reims · Confiez votre bien · Dupuis Immobilier" },
      {
        name: "description",
        content:
          "Propriétaires bailleurs à Reims : confiez la gestion locative de votre bien à Julien Dupuis. Sélection des locataires, loyers garantis, gestion complète.",
      },
      { property: "og:title", content: "Gestion locative à Reims · Dupuis Immobilier" },
      {
        property: "og:description",
        content:
          "Sélection des locataires, loyers garantis, zéro stress. Devis gratuit sous 24h.",
      },
    ],
  }),
  component: LouerPage,
});

const HERO_IMG =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80&auto=format&fit=crop";

const BENEFITS = [
  {
    icon: Search,
    title: "Sélection rigoureuse",
    desc: "Chaque candidat est étudié : revenus, stabilité professionnelle, garant. Vous ne louez qu'à des locataires fiables et solvables.",
  },
  {
    icon: FileText,
    title: "Gestion complète",
    desc: "Rédaction du bail, état des lieux entrée et sortie, quittances mensuelles, gestion des réparations. Vous ne faites rien.",
  },
  {
    icon: Wallet,
    title: "Loyers sécurisés",
    desc: "Suivi des paiements, relances amiables, interface avec votre assurance loyers impayés si besoin. Vos revenus locatifs arrivent chaque mois.",
  },
];

const INCLUDED_LEFT = [
  "Estimation du loyer de marché",
  "Rédaction et diffusion de l'annonce",
  "Organisation et gestion des visites",
  "Étude complète des dossiers",
  "Rédaction du contrat de bail",
  "État des lieux d'entrée",
];
const INCLUDED_RIGHT = [
  "Encaissement des loyers",
  "Émission des quittances",
  "État des lieux de sortie",
  "Gestion des réparations courantes",
  "Déclaration fiscale simplifiée",
  "Compte-rendu mensuel propriétaire",
];

const PRICING = [
  {
    name: "Mise en location seule",
    price: "1 mois de loyer TTC",
    highlight: false,
    items: [
      "Estimation loyer marché",
      "Annonce + diffusion",
      "Visites",
      "Sélection locataire",
      "Rédaction bail",
      "État des lieux entrée",
    ],
    cta: "Demander un devis",
  },
  {
    name: "Gestion locative complète",
    price: "7% du loyer HC/mois",
    highlight: true,
    items: [
      "Mise en location incluse",
      "Encaissement loyers",
      "Quittances mensuelles",
      "Gestion réparations",
      "Compte-rendu mensuel",
      "État des lieux sortie",
    ],
    cta: "C'est cette formule que je veux",
  },
  {
    name: "Gestion + Garantie loyers",
    price: "9% du loyer HC/mois",
    highlight: false,
    items: [
      "Gestion complète incluse",
      "Assurance loyers impayés",
      "Protection juridique",
      "Loyer versé même si impayé",
    ],
    cta: "Demander un devis",
  },
];

const STEPS = [
  {
    title: "Estimation gratuite",
    desc: "Je visite votre bien et vous donne une estimation précise du loyer de marché en 48h. Sans engagement.",
  },
  {
    title: "Mise en valeur",
    desc: "Photos professionnelles, description soignée, diffusion sur SeLoger, Leboncoin, PAP et les réseaux sociaux.",
  },
  {
    title: "Sélection du locataire",
    desc: "Je reçois les candidatures, étudie les dossiers et vous présente le ou les candidats retenus. Vous avez le dernier mot.",
  },
  {
    title: "Gestion sereine",
    desc: "Une fois le locataire en place, je gère tout. Vous recevez vos loyers et un compte-rendu mensuel. C'est tout.",
  },
];

function LouerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <Breadcrumbs items={[{ label: "Gestion locative" }]} />
      <main>
        <Hero />
        <Benefits />
        <Included />
        <RentSimulator />
        <Pricing />
        <Process />
        <QuoteForm />
        <Reassurance />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center text-white overflow-hidden">
      <img
        src={HERO_IMG}
        alt="Intérieur lumineux d'un appartement à Reims confié en gestion locative"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 py-24 text-center">
        <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-6">
          Propriétaires bailleurs · Reims
        </span>
        <h1 className="!text-white font-display text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
          Confiez votre bien en gestion locative à Reims
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-10">
          Sélection des locataires · Loyers garantis · Zéro stress pour vous
        </p>
        <a
          href="#devis"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-all hover:-translate-y-0.5 shadow-card"
        >
          Obtenir un devis gratuit
        </a>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl">
            Pourquoi choisir Dupuis Immobilier pour gérer votre bien ?
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-10 rounded-lg bg-cream border border-border hover:border-gold transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center mb-6">
                  <Icon className="text-gold" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl mb-3">{b.title}</h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Included() {
  return (
    <section className="py-24 px-6 bg-cream">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl">Tout est inclus dans la gestion locative</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 bg-white p-10 rounded-2xl shadow-soft">
          {[INCLUDED_LEFT, INCLUDED_RIGHT].map((col, i) => (
            <ul key={i} className="space-y-4">
              {col.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center mt-0.5">
                    <Check size={14} className="text-gold" strokeWidth={3} />
                  </span>
                  <span className="text-navy">{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl">Des honoraires clairs et sans surprise</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-2xl border transition-all ${
                p.highlight
                  ? "bg-navy text-white border-navy shadow-card md:-translate-y-4"
                  : "bg-white border-border hover:border-gold"
              }`}
            >
              <h3 className={`text-xl mb-2 ${p.highlight ? "!text-white" : ""}`}>{p.name}</h3>
              <div
                className={`font-display text-3xl mb-6 ${
                  p.highlight ? "text-gold" : "text-navy"
                }`}
              >
                {p.price}
              </div>
              <ul className="space-y-3 mb-8">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className={p.highlight ? "text-gold mt-0.5 shrink-0" : "text-gold mt-0.5 shrink-0"}
                      strokeWidth={3}
                    />
                    <span className={p.highlight ? "text-white/90" : "text-foreground/80"}>{it}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#devis"
                className={`block text-center w-full px-5 py-3 rounded-lg font-semibold transition-colors ${
                  p.highlight
                    ? "bg-gold text-navy hover:bg-gold/90"
                    : "border border-navy text-navy hover:bg-navy hover:text-white"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Honoraires conformes à la loi Alur · Pas de frais cachés
        </p>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-24 px-6 bg-cream">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl">Confier son bien en 4 étapes simples</h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
        <ol className="relative border-l-2 border-gold/30 pl-8 space-y-10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[42px] top-0 w-10 h-10 rounded-full bg-gold text-navy font-display text-lg flex items-center justify-center shadow-soft">
                {i + 1}
              </span>
              <h3 className="text-xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type FormState = {
  bienType: string;
  surface: string;
  pieces: string;
  adresse: string;
  etat: string;
  occupation: string;
  meuble: string;
  profil: string;
  candidat: string;
  delai: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  contactPref: string;
  message: string;
  rgpd: boolean;
};

const INITIAL: FormState = {
  bienType: "",
  surface: "",
  pieces: "",
  adresse: "",
  etat: "",
  occupation: "",
  meuble: "",
  profil: "",
  candidat: "",
  delai: "",
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  contactPref: "",
  message: "",
  rgpd: false,
};

const BIEN_TYPES = [
  { value: "appartement", label: "Appartement", icon: Building2 },
  { value: "maison", label: "Maison", icon: HomeIcon },
  { value: "local", label: "Local commercial", icon: Store },
  { value: "villa", label: "Villa", icon: Trees },
];

function QuoteForm() {
  const [f, setF] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.rgpd) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="devis" className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto bg-[#FAF7F2] rounded-2xl shadow-card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Check className="text-gold" size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl mb-4">Demande reçue !</h2>
          <p className="text-foreground/80">
            Julien Dupuis vous contacte sous 24h pour votre bien situé à{" "}
            <strong>{f.adresse || "Reims"}</strong>.
          </p>
          <p className="text-foreground/70 mt-3 text-sm">
            Un email de confirmation vient de vous être envoyé.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="devis" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl">Demandez votre devis gratuit en 2 minutes</h2>
          <p className="text-foreground/70 mt-4 max-w-xl mx-auto">
            Je vous rappelle sous 24h avec une première estimation du loyer et une proposition
            personnalisée.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-[#FAF7F2] rounded-2xl shadow-card p-8 sm:p-10 space-y-10"
        >
          {/* Bloc 1 — Votre bien */}
          <fieldset className="space-y-6">
            <div className="h-px bg-gold/60 mb-4" />
            <span className="inline-block bg-navy text-white text-[13px] font-medium rounded-[20px] px-3 py-1">① Votre bien</span>

            <div>
              <label className="block text-sm font-medium text-navy mb-3">Type de bien</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BIEN_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = f.bienType === t.value;
                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => set("bienType", t.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        active
                          ? "border-gold bg-gold/10"
                          : "border-border bg-white hover:border-gold/50"
                      }`}
                    >
                      <Icon className="mx-auto mb-2 text-navy" size={24} />
                      <span className="text-sm font-medium text-navy">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Select label="Surface" value={f.surface} onChange={(v) => set("surface", v)} options={[
              "Moins de 30m²", "30-50m²", "50-70m²", "70-100m²", "Plus de 100m²",
            ]} />

            <Select label="Nombre de pièces" value={f.pieces} onChange={(v) => set("pieces", v)} options={[
              "Studio", "2 pièces", "3 pièces", "4 pièces", "5 pièces et plus",
            ]} />

            <Field label="Adresse ou quartier">
              <input
                type="text"
                value={f.adresse}
                onChange={(e) => set("adresse", e.target.value)}
                placeholder="Ex: Clairmarais, Avenue de Laon, Centre-ville..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
              />
            </Field>

            <RadioGroup
              label="État général du bien"
              name="etat"
              value={f.etat}
              onChange={(v) => set("etat", v)}
              options={["Excellent état", "Bon état", "Quelques travaux à prévoir"]}
            />

            <RadioGroup
              label="Le bien est actuellement"
              name="occupation"
              value={f.occupation}
              onChange={(v) => set("occupation", v)}
              options={["Vacant (libre)", "Occupé (locataire en place)", "En cours de libération"]}
            />

            <RadioGroup
              label="Meublé ou non meublé ?"
              name="meuble"
              value={f.meuble}
              onChange={(v) => set("meuble", v)}
              options={["Non meublé", "Meublé", "Je ne sais pas encore"]}
            />
          </fieldset>

          {/* Bloc 2 — Votre situation */}
          <fieldset className="space-y-6 pt-8">
            <div className="h-px bg-gold/60 mb-4" />
            <span className="inline-block bg-navy text-white text-[13px] font-medium rounded-[20px] px-3 py-1">② Votre situation</span>

            <RadioGroup
              label="Êtes-vous"
              name="profil"
              value={f.profil}
              onChange={(v) => set("profil", v)}
              options={[
                "Propriétaire occupant qui part",
                "Propriétaire bailleur (déjà bailleur)",
                "Primo-investisseur",
                "Investisseur avec plusieurs biens",
              ]}
            />

            <RadioGroup
              label="Avez-vous déjà un locataire en tête ?"
              name="candidat"
              value={f.candidat}
              onChange={(v) => set("candidat", v)}
              options={[
                "Non — je pars de zéro",
                "Oui — j'ai déjà un candidat",
                "Je suis en train de chercher",
              ]}
            />

            <Select
              label="Quand souhaitez-vous mettre en location ?"
              value={f.delai}
              onChange={(v) => set("delai", v)}
              options={[
                "Dès que possible",
                "Dans 1 mois",
                "Dans 2-3 mois",
                "Dans 6 mois",
                "Je ne sais pas encore",
              ]}
            />
          </fieldset>

          {/* Bloc 3 — Coordonnées */}
          <fieldset className="space-y-6 border-t border-border pt-8">
            <legend className="font-display text-xl text-navy mb-2">Vos coordonnées</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Prénom *">
                <input required value={f.prenom} onChange={(e) => set("prenom", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold" />
              </Field>
              <Field label="Nom *">
                <input required value={f.nom} onChange={(e) => set("nom", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold" />
              </Field>
              <Field label="Email *">
                <input type="email" required value={f.email} onChange={(e) => set("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold" />
              </Field>
              <Field label="Téléphone *">
                <input type="tel" required value={f.telephone} onChange={(e) => set("telephone", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold" />
              </Field>
            </div>

            <RadioGroup
              label="Comment préférez-vous être contacté ?"
              name="contactPref"
              value={f.contactPref}
              onChange={(v) => set("contactPref", v)}
              options={["Par téléphone", "Par email", "Par WhatsApp"]}
            />

            <Field label="Message (optionnel)">
              <textarea
                rows={4}
                value={f.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Des questions particulières ? Des précisions sur votre bien ?"
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold resize-none"
              />
            </Field>

            <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={f.rgpd}
                onChange={(e) => set("rgpd", e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#C9A96E]"
              />
              <span>
                J'accepte que mes données soient utilisées pour me recontacter dans le cadre de
                ma demande. Conformément au RGPD, je dispose d'un droit d'accès et de
                suppression.
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="w-full px-8 py-4 rounded-lg bg-gold text-navy font-semibold text-lg hover:bg-gold/90 transition-all shadow-card inline-flex items-center justify-center gap-2"
          >
            Recevoir mon devis gratuit <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy mb-2">{label}</label>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
      >
        <option value="">Sélectionnez...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
              value === o ? "border-gold bg-gold/5" : "border-border bg-white hover:border-gold/40"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="w-4 h-4 accent-[#C9A96E]"
            />
            <span className="text-sm text-navy">{o}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

function Reassurance() {
  return (
    <section className="bg-navy text-white py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="!text-white font-display text-3xl sm:text-4xl mb-10">
          Votre bien mérite une gestion irréprochable
        </h2>
        <img
          src={portraitJulien.url}
          alt="Julien Dupuis, agent immobilier à Reims"
          className="w-20 h-20 rounded-full object-cover mx-auto mb-6 ring-2 ring-gold"
        />
        <blockquote className="text-lg sm:text-xl text-white/90 italic mb-4 max-w-2xl mx-auto">
          « Je gère chaque bien comme si c'était le mien. Rigueur, transparence, et un seul
          interlocuteur du premier au dernier jour. »
        </blockquote>
        <p className="text-gold font-medium mb-10">— Julien Dupuis</p>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Badge icon={Award} label="Carte T professionnelle" />
          <Badge icon={BadgeCheck} label="Membre FNAIM" />
          <Badge icon={ShieldCheck} label="RCP assurée" />
        </div>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-navy transition-all"
        >
          Prendre contact <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function Badge({ icon: Icon, label }: { icon: typeof Award; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white">
      <Icon size={16} className="text-gold" /> {label}
    </span>
  );
}
