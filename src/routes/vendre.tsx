import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/SiteChrome";
import { Check, Target, Camera, Megaphone, ClipboardCheck, Users, Handshake, Phone } from "lucide-react";
import portraitOutdoor from "@/assets/photo-profil-1.jpg.asset.json";

export const Route = createFileRoute("/vendre")({
  head: () => ({
    meta: [
      { title: "Vendre votre bien à Reims · Dupuis Immobilier" },
      { name: "description", content: "Vendez votre appartement ou votre maison à Reims au meilleur prix avec Dupuis Immobilier. Estimation gratuite en 48h." },
      { property: "og:title", content: "Vendre avec Dupuis Immobilier" },
      { property: "og:description", content: "Estimation gratuite, mise en valeur professionnelle, diffusion sur 15+ portails." },
    ],
  }),
  component: SellPage,
});

const REASONS = [
  { icon: Target, title: "Estimation précise", desc: "Basée sur les ventes réelles du quartier, pas sur des moyennes nationales floues." },
  { icon: Camera, title: "Mise en valeur professionnelle", desc: "Photos HDR, description optimisée, visite virtuelle 3D et plan 2D inclus." },
  { icon: Megaphone, title: "Diffusion maximale", desc: "Plus de 15 portails dont SeLoger, Leboncoin, PAP, Bien'ici et notre réseau privé." },
];

const STEPS = [
  { icon: ClipboardCheck, title: "1. Estimation", desc: "Visite de votre bien et estimation argumentée sous 48h, sans engagement." },
  { icon: Camera, title: "2. Mise en valeur", desc: "Reportage photo, description rédigée par un copywriter, plan et visite virtuelle." },
  { icon: Megaphone, title: "3. Diffusion ciblée", desc: "Annonce diffusée sur 15+ portails et envoyée à notre fichier d'acquéreurs qualifiés." },
  { icon: Users, title: "4. Visites filtrées", desc: "Je sélectionne les acquéreurs solvables et organise toutes les visites pour vous." },
  { icon: Handshake, title: "5. Négociation & signature", desc: "Je vous accompagne jusqu'à la signature notariale en sécurisant chaque étape." },
];

export function EstimationForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="bg-cream rounded-xl p-10 text-center">
        <Check size={36} className="mx-auto text-gold mb-3" />
        <h3 className="font-display text-2xl text-navy mb-2">Demande envoyée</h3>
        <p className="text-foreground/70">Vous recevrez votre estimation sous 48h ouvrées.</p>
      </div>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="bg-white rounded-xl shadow-soft border border-border p-6 lg:p-10 space-y-6"
    >
      <RadioGroup name="type" label="Type de bien" options={["Appartement", "Maison", "Local commercial"]} />
      <SelectField name="surface" label="Surface approximative" options={["Moins de 50 m²", "50 - 80 m²", "80 - 120 m²", "Plus de 120 m²"]} />
      <RadioGroup name="rooms" label="Nombre de pièces" options={["1", "2", "3", "4", "5+"]} />
      <RadioGroup name="state" label="État général" options={["À rénover", "Bon état", "Rénové", "Neuf"]} />
      <TextField name="address" label="Adresse ou quartier" placeholder="Ex : Centre-ville, rue Cérès" />
      <div className="grid sm:grid-cols-3 gap-4">
        <TextField name="firstname" label="Prénom" required />
        <TextField name="email" type="email" label="Email" required />
        <TextField name="phone" type="tel" label="Téléphone" required />
      </div>
      <RadioGroup
        name="callback"
        label="Souhaitez-vous être rappelé(e) ?"
        options={["Oui, dès que possible", "Cette semaine", "Je préfère qu'on m'écrive"]}
      />
      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors shadow-card"
      >
        Recevoir mon estimation gratuite
      </button>
    </form>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-navy mb-2">{label}{required && <span className="text-gold"> *</span>}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={200}
        className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold"
      />
    </label>
  );
}

export function SelectField({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-navy mb-2">{label}</span>
      <select
        name={name}
        className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function RadioGroup({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-navy mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={name} value={o} className="peer sr-only" defaultChecked={o === options[0]} />
            <span className="px-4 py-2.5 rounded-lg border border-border text-sm text-navy bg-white peer-checked:bg-navy peer-checked:text-white peer-checked:border-navy transition-colors inline-block">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckboxGroup({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-navy mb-3">{label}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white cursor-pointer hover:border-gold text-sm">
            <input type="checkbox" name={name} value={o} className="accent-[var(--color-gold)]" />
            <span className="text-navy">{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SellPage() {
  return (
    <PageShell>
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Vendre à Reims
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-5">
            Vendez votre bien au meilleur prix
          </h1>
          <p className="text-lg text-foreground/70">
            Un accompagnement personnalisé, une stratégie sur-mesure, des résultats prouvés.
          </p>
        </div>
      </section>

      <section className="bg-cream py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl text-navy text-center mb-12">Pourquoi nous choisir</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="bg-white rounded-xl p-7 shadow-soft">
                  <Icon className="text-gold mb-4" size={32} strokeWidth={1.5} />
                  <h3 className="font-display text-xl text-navy mb-2">{r.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-navy text-center mb-12">Comment ça se passe</h2>
          <div className="space-y-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex gap-5 items-start bg-white border border-border rounded-xl p-6 shadow-soft">
                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0">
                    <Icon className="text-gold" size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-navy mb-1">{s.title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-center">
          <img
            src={portraitOutdoor.url}
            alt="Julien Dupuis, agent immobilier indépendant à Reims"
            loading="lazy"
            className="w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] object-cover rounded-full mx-auto md:mx-0 shadow-card border-4 border-white"
          />
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl sm:text-3xl text-navy mb-3">
              Julien Dupuis vous répond personnellement
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6">
              Pas de secrétariat, pas de standardiste. Votre dossier est entre mes mains du premier rendez-vous jusqu'à la signature.
            </p>
            <a
              href="tel:+33326000000"
              className="inline-flex items-center gap-3 font-display text-2xl sm:text-3xl text-navy hover:text-gold transition-colors"
            >
              <Phone size={26} className="text-gold" />
              +33 3 26 00 00 00
            </a>
          </div>
        </div>
      </section>


      <section id="form" className="bg-cream py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-navy mb-3">
              Estimez votre bien gratuitement en 48h
            </h2>
            <p className="text-foreground/70">Sans engagement. Réponse argumentée par un expert local.</p>
          </div>
          <EstimationForm />
        </div>
      </section>
    </PageShell>
  );
}
