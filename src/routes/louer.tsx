import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/SiteChrome";
import { TextField, RadioGroup, SelectField } from "./vendre";
import { Check, ShieldCheck, Camera, Megaphone, ClipboardCheck, Users, Handshake } from "lucide-react";

export const Route = createFileRoute("/louer")({
  head: () => ({
    meta: [
      { title: "Louer votre bien à Reims · Dupuis Immobilier" },
      { name: "description", content: "Confiez la location de votre bien à Reims à Dupuis Immobilier. Sélection rigoureuse des locataires et gestion locative complète." },
      { property: "og:title", content: "Louer avec Dupuis Immobilier" },
      { property: "og:description", content: "Gestion locative complète et sécurisée à Reims." },
    ],
  }),
  component: RentPage,
});

const REASONS = [
  { icon: ShieldCheck, title: "Sélection rigoureuse", desc: "Vérification systématique des dossiers : revenus, garants, références. Vacance locative minimisée." },
  { icon: Camera, title: "Mise en valeur professionnelle", desc: "Photos HDR, descriptif détaillé, visite virtuelle pour louer plus vite et au juste prix." },
  { icon: Megaphone, title: "Diffusion sur 15+ portails", desc: "SeLoger, Leboncoin, PAP, Bien'ici et notre base de locataires en recherche active." },
];

const STEPS = [
  { icon: ClipboardCheck, title: "1. Visite & estimation du loyer", desc: "Étude du marché locatif rémois pour fixer le juste loyer, conforme à l'encadrement." },
  { icon: Camera, title: "2. Mise en valeur", desc: "Reportage photo et description optimisée pour attirer les meilleurs profils." },
  { icon: Megaphone, title: "3. Diffusion", desc: "Annonce mise en ligne sur tous les portails et envoyée à nos locataires en recherche." },
  { icon: Users, title: "4. Sélection du locataire", desc: "Vérification approfondie des dossiers, visites organisées et présentation des candidatures." },
  { icon: Handshake, title: "5. Signature & gestion", desc: "Rédaction du bail, état des lieux et — si vous le souhaitez — gestion complète au quotidien." },
];

function RentForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="bg-cream rounded-xl p-10 text-center">
        <Check size={36} className="mx-auto text-gold mb-3" />
        <h3 className="font-display text-2xl text-navy mb-2">Demande envoyée</h3>
        <p className="text-foreground/70">Je vous recontacte sous 48h ouvrées.</p>
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
      <RadioGroup name="type" label="Type de bien à louer" options={["Appartement", "Maison", "Local commercial"]} />
      <SelectField name="surface" label="Surface approximative" options={["Moins de 30 m²", "30 - 60 m²", "60 - 90 m²", "Plus de 90 m²"]} />
      <TextField name="rent" type="number" label="Loyer souhaité (€/mois)" placeholder="Ex : 750" required />
      <TextField name="address" label="Adresse ou quartier" placeholder="Ex : Quartier des Sacres" />
      <RadioGroup name="gestion" label="Souhaitez-vous la gestion locative complète ?" options={["Oui, gestion complète", "Non, mise en location uniquement", "À discuter"]} />
      <div className="grid sm:grid-cols-3 gap-4">
        <TextField name="firstname" label="Prénom" required />
        <TextField name="email" type="email" label="Email" required />
        <TextField name="phone" type="tel" label="Téléphone" required />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors shadow-card"
      >
        Demander une étude locative
      </button>
    </form>
  );
}

function RentPage() {
  return (
    <PageShell>
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&q=80)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Louer à Reims
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-5">
            Louez votre bien en toute sérénité
          </h1>
          <p className="text-lg text-foreground/70">
            Sélection rigoureuse des locataires, gestion sécurisée et accompagnement humain.
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

      <section className="bg-cream py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-navy mb-3">Confiez-nous votre bien</h2>
            <p className="text-foreground/70">Étude personnalisée et estimation du loyer optimal sous 48h.</p>
          </div>
          <RentForm />
        </div>
      </section>
    </PageShell>
  );
}
