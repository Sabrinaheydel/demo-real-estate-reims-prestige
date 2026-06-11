import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PageShell } from "@/components/site/SiteChrome";
import { TextField, SelectField } from "./vendre";
import { Check, MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import portraitInterior from "@/assets/photo-profil-3.jpg.asset.json";

const contactSearchSchema = z.object({
  reference: z.string().trim().max(30).optional(),
  listing: z.string().trim().max(160).optional(),
  intent: z.enum(["infos", "visite"]).optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: (search) => contactSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Contact · Dupuis Immobilier Reims" },
      { name: "description", content: "Contactez Dupuis Immobilier à Reims agence située rue de Vesle. Vente, location, estimation gratuite." },
      { property: "og:title", content: "Contactez Dupuis Immobilier à Reims" },
      { property: "og:description", content: "Adresse, téléphone et formulaire de contact." },
    ],
  }),
  component: ContactPage,
});

type ContactFormProps = {
  reference?: string;
  listing?: string;
  intent?: "infos" | "visite";
};

function ContactForm({ reference, listing, intent }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const [rgpd, setRgpd] = useState(false);

  const defaultObject = intent === "visite" ? "Demande de visite" : reference ? "Infos sur un bien" : "Acheter";
  const defaultMessage = useMemo(() => {
    if (!reference && !listing) return "";
    return `Bonjour,\n\nJe souhaite ${intent === "visite" ? "organiser une visite" : "obtenir plus d'informations"} concernant ${listing ? `le bien « ${listing} »` : "ce bien"}${reference ? ` (${reference})` : ""}.`;
  }, [intent, listing, reference]);

  if (sent) {
    return (
      <div className="bg-cream rounded-xl p-10 text-center">
        <Check size={36} className="mx-auto text-gold mb-3" />
        <h3 className="font-display text-2xl text-navy mb-2">Email préparé</h3>
        <p className="text-foreground/70">Votre logiciel de messagerie s'ouvre avec la référence du bien déjà renseignée.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!rgpd) return;
        const data = new FormData(e.currentTarget);
        const firstName = String(data.get("firstname") ?? "").trim();
        const lastName = String(data.get("lastname") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const phone = String(data.get("phone") ?? "").trim();
        const object = String(data.get("object") ?? defaultObject).trim();
        const message = String(data.get("message") ?? "").trim();

        const subject = `${object}${reference ? ` - ${reference}` : ""}`;
        const body = [
          "Bonjour,",
          "",
          listing || reference
            ? `Je vous contacte au sujet ${listing ? `du bien « ${listing} »` : "de ce bien"}${reference ? ` (${reference})` : ""}.`
            : "Je vous contacte concernant mon projet immobilier.",
          "",
          `Prénom : ${firstName}`,
          `Nom : ${lastName}`,
          `Email : ${email}`,
          `Téléphone : ${phone}`,
          `Objet : ${object}`,
          reference ? `Référence : ${reference}` : undefined,
          "",
          "Message :",
          message,
        ]
          .filter(Boolean)
          .join("\n");

        window.location.href = `mailto:contact@dupuis-immobilier.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
      className="bg-white rounded-xl shadow-soft border border-border p-6 lg:p-10 space-y-5"
    >
      {(reference || listing) && (
        <div className="rounded-lg border border-gold/30 bg-cream px-4 py-3 text-sm text-navy">
          <div className="font-semibold">Bien concerné</div>
          <div className="text-foreground/80">{listing || "Annonce immobilière"}</div>
          {reference && <div className="text-gold font-medium mt-1">Réf. {reference}</div>}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField name="firstname" label="Prénom" required />
        <TextField name="lastname" label="Nom" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField name="email" type="email" label="Email" required />
        <TextField name="phone" type="tel" label="Téléphone" required />
      </div>
      <SelectField name="object" label="Objet" options={["Vendre", "Louer", "Acheter", "Demande de visite", "Infos sur un bien", "Estimation", "Autre"]} />
      <label className="block">
        <span className="block text-sm font-medium text-navy mb-2">Message <span className="text-gold">*</span></span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={1000}
          defaultValue={defaultMessage}
          placeholder="Détaillez votre demande…"
          className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold resize-none"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
        <input
          type="checkbox"
          checked={rgpd}
          onChange={(e) => setRgpd(e.target.checked)}
          className="mt-1 accent-[var(--color-gold)]"
        />
        <span>
          J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la politique RGPD.
        </span>
      </label>
      <button
        type="submit"
        disabled={!rgpd}
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Envoyer
      </button>
    </form>
  );
}

function ContactPage() {
  const search = Route.useSearch();

  return (
    <PageShell breadcrumbs={[{ label: "Contact" }]}> 
      <section className="relative w-full h-[250px] sm:h-[400px] overflow-hidden mt-6">
        <img
          src={portraitInterior.url}
          alt="Julien Dupuis dans un appartement haussmannien à Reims"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "top" }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(27,45,79,0.4)" }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-display text-3xl sm:text-5xl text-white mb-3">Parlons de votre projet</h1>
          <p className="text-white/90 text-base sm:text-lg max-w-xl">
            Je réponds personnellement à chaque demande sous 24h
          </p>
        </div>
      </section>

      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto rounded-xl overflow-hidden border border-border aspect-[16/7]">
          <iframe
            title="Localisation Dupuis Immobilier"
            src="https://www.google.com/maps?q=Reims,France&output=embed"
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-10">
          <aside className="space-y-6">
            <div className="bg-cream rounded-xl p-6">
              <h2 className="font-display text-xl text-navy mb-5">Informations</h2>
              <ul className="space-y-4 text-sm text-foreground/80">
                <li className="flex gap-3"><MapPin size={18} className="text-gold shrink-0 mt-0.5"/><span>24 rue de Vesle<br/>51100 Reims</span></li>
                <li className="flex gap-3"><Phone size={18} className="text-gold shrink-0 mt-0.5"/><a href="tel:+33326000000" className="hover:text-gold">+33 3 26 00 00 00</a></li>
                <li className="flex gap-3"><Mail size={18} className="text-gold shrink-0 mt-0.5"/><a href="mailto:contact@dupuis-immobilier.fr" className="hover:text-gold">contact@dupuis-immobilier.fr</a></li>
                <li className="flex gap-3"><Clock size={18} className="text-gold shrink-0 mt-0.5"/><span>Lun – Ven : 9h – 19h<br/>Sam : 10h – 17h<br/>Dim : sur rendez-vous</span></li>
              </ul>
            </div>
            <div className="bg-cream rounded-xl p-6">
              <h2 className="font-display text-xl text-navy mb-4">Suivez-nous</h2>
              <div className="flex gap-3">
                <a href="https://facebook.com/dupuisimmobilierreims" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-navy transition-colors"><Facebook size={18}/></a>
                <a href="https://instagram.com/dupuis.immobilier" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-navy transition-colors"><Instagram size={18}/></a>
                <a href="https://linkedin.com/in/julien-dupuis-immobilier" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-navy transition-colors"><Linkedin size={18}/></a>
                <a href="https://maps.google.com/?q=Reims,France" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-navy transition-colors"><MapPin size={18}/></a>
              </div>
            </div>
          </aside>
          <ContactForm reference={search.reference} listing={search.listing} intent={search.intent} />
        </div>
      </section>
    </PageShell>
  );
}
