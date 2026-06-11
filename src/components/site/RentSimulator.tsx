import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Home as HomeIcon, Sofa, Square, Sparkles, ThumbsUp, Wrench, Phone, Download } from "lucide-react";
import { jsPDF } from "jspdf";

type BienType = "appartement" | "maison" | "meuble" | "studio";
type Etat = "renove" | "bon" | "rafraichir";

const QUARTIERS: { value: string; label: string; prices: Record<BienType, number> }[] = [
  { value: "hypercentre", label: "Hypercentre / Place d'Erlon", prices: { appartement: 14, maison: 12, meuble: 16, studio: 18 } },
  { value: "centre-historique", label: "Centre historique / Cathédrale", prices: { appartement: 13, maison: 11, meuble: 15, studio: 17 } },
  { value: "clairmarais", label: "Clairmarais", prices: { appartement: 12, maison: 11, meuble: 14, studio: 16 } },
  { value: "jean-jaures", label: "Jean Jaurès / CHU", prices: { appartement: 11, maison: 10, meuble: 13, studio: 15 } },
  { value: "laon", label: "Avenue de Laon / Nord", prices: { appartement: 10, maison: 9, meuble: 12, studio: 14 } },
  { value: "bezannes", label: "Bezannes / Reims Sud", prices: { appartement: 11, maison: 10, meuble: 13, studio: 15 } },
  { value: "cormontreuil", label: "Cormontreuil", prices: { appartement: 10, maison: 10, meuble: 12, studio: 14 } },
  { value: "sacres", label: "Quartier des Sacres", prices: { appartement: 11, maison: 10, meuble: 13, studio: 15 } },
  { value: "autre", label: "Autre secteur Reims", prices: { appartement: 10, maison: 9, meuble: 12, studio: 14 } },
];

const BIEN_OPTS: { value: BienType; label: string; Icon: typeof Building2 }[] = [
  { value: "appartement", label: "Appartement", Icon: Building2 },
  { value: "maison", label: "Maison", Icon: HomeIcon },
  { value: "meuble", label: "Meublé", Icon: Sofa },
  { value: "studio", label: "Studio", Icon: Square },
];

const ETAT_OPTS: { value: Etat; label: string; Icon: typeof Sparkles; coef: number }[] = [
  { value: "renove", label: "Rénové", Icon: Sparkles, coef: 1.1 },
  { value: "bon", label: "Bon état", Icon: ThumbsUp, coef: 1.0 },
  { value: "rafraichir", label: "À rafraîchir", Icon: Wrench, coef: 0.9 },
];

function useCounter(target: number, duration = 400) {
  const [val, setVal] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    const from = ref.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else ref.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function AnimatedNum({ value, suffix = "", decimals = 0, className = "" }: { value: number; suffix?: string; decimals?: number; className?: string }) {
  const v = useCounter(value);
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  const formatted = decimals
    ? v.toFixed(decimals)
    : Math.round(v).toLocaleString("fr-FR");
  return (
    <span className={`transition-colors duration-300 ${flash ? "text-gold" : ""} ${className}`}>
      {formatted}
      {suffix}
    </span>
  );
}

export function RentSimulator() {
  const [bien, setBien] = useState<BienType>("appartement");
  const [surface, setSurface] = useState(60);
  const [quartier, setQuartier] = useState("clairmarais");
  const [etat, setEtat] = useState<Etat>("bon");
  const [valeur, setValeur] = useState("");
  const valeurRef = useRef<HTMLInputElement>(null);

  const calc = useMemo(() => {
    const q = QUARTIERS.find((x) => x.value === quartier)!;
    const coef = ETAT_OPTS.find((x) => x.value === etat)!.coef;
    const brutRaw = surface * q.prices[bien] * coef;
    const brut = Math.floor(brutRaw / 10) * 10;
    const bas = Math.round(brut * 0.92);
    const haut = Math.round(brut * 1.08);
    const honoraires = Math.round(brut * 0.07);
    const net = brut - honoraires;
    const annuel = net * 12;
    const valNum = parseFloat(valeur.replace(/\s/g, "")) || 0;
    const rdtBrut = valNum > 0 ? +((brut * 12 / valNum) * 100).toFixed(2) : 0;
    const rdtNet = valNum > 0 ? +((net * 12 / valNum) * 100).toFixed(2) : 0;
    return { brut, bas, haut, honoraires, net, annuel, rdtBrut, rdtNet, valNum };
  }, [bien, surface, quartier, etat, valeur]);

  const marketTip = (() => {
    if (!calc.valNum) return null;
    if (calc.rdtNet < 3) return { emoji: "🟡", text: "Rendement modéré — Ce bien offre une bonne valorisation patrimoniale à long terme." };
    if (calc.rdtNet < 5) return { emoji: "🟢", text: "Bon rendement — Dans la moyenne haute du marché rémois 2026." };
    if (calc.rdtNet <= 7) return { emoji: "🟢", text: "Excellent rendement — Ce bien est un très bon investissement locatif." };
    return { emoji: "⭐", text: "Rendement exceptionnel — Vérifiez les caractéristiques du bien pour confirmer cette estimation." };
  })();

  const sliderPct = ((surface - 15) / (200 - 15)) * 100;

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const quartierLabel = QUARTIERS.find((q) => q.value === quartier)?.label ?? "";
    const bienLabel = BIEN_OPTS.find((b) => b.value === bien)?.label ?? "";
    const etatLabel = ETAT_OPTS.find((e) => e.value === etat)?.label ?? "";
    const fmt = (n: number) => n.toLocaleString("fr-FR");
    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Simulation de revenus locatifs", 40, y);
    y += 8;
    doc.setDrawColor(201, 169, 110);
    doc.line(40, y, 200, y);
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Dupuis Immobilier - Reims", 40, y);
    y += 16;
    doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 40, y);
    y += 28;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Caractéristiques du bien", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    [
      `Type de bien : ${bienLabel}`,
      `Surface : ${surface} m²`,
      `Secteur : ${quartierLabel}`,
      `État : ${etatLabel}`,
      ...(calc.valNum > 0 ? [`Valeur estimée : ${fmt(calc.valNum)} €`] : []),
    ].forEach((line) => {
      doc.text(line, 40, y);
      y += 16;
    });
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Résultats de l'estimation", 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = [
      `Loyer mensuel estimé : entre ${fmt(calc.bas)} € et ${fmt(calc.haut)} €`,
      `Valeur centrale : ${fmt(calc.brut)} € / mois`,
      `Honoraires de gestion (7%) : ${fmt(calc.honoraires)} € / mois`,
      `Revenu net mensuel : ${fmt(calc.net)} € / mois`,
      `Revenu net annuel : ${fmt(calc.annuel)} € / an`,
    ];
    if (calc.valNum > 0) {
      lines.push(`Rendement brut : ${calc.rdtBrut.toFixed(2)} %`);
      lines.push(`Rendement net après honoraires : ${calc.rdtNet.toFixed(2)} %`);
    }
    lines.forEach((line) => {
      doc.text(line, 40, y);
      y += 16;
    });
    y += 20;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(110);
    const legal = doc.splitTextToSize(
      "Mention légale : ces estimations sont fournies à titre purement indicatif et sont basées sur les données du marché locatif rémois observées en 2026. Elles ne constituent pas une offre contractuelle ni un engagement de location. Une visite du bien et une étude personnalisée sont nécessaires pour établir une estimation précise. Dupuis Immobilier - Carte professionnelle T - RCP en vigueur.",
      515,
    );
    doc.text(legal, 40, y);

    doc.save(`simulation-loyer-${surface}m2-${quartier}.pdf`);
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl">💰 Simulez vos revenus locatifs</h2>
          <p className="text-muted-foreground mt-3">
            Estimation instantanée — données marché rémois 2026
          </p>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>

        <div
          className="rounded-2xl p-6 sm:p-10"
          style={{ background: "#FAF7F2", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* INPUTS */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy mb-3">Type de bien</label>
                <div className="grid grid-cols-2 gap-2">
                  {BIEN_OPTS.map((o) => {
                    const active = bien === o.value;
                    const Icon = o.Icon;
                    return (
                      <button
                        type="button"
                        key={o.value}
                        onClick={() => setBien(o.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          active ? "border-gold bg-gold/10" : "border-border bg-white hover:border-gold/50"
                        }`}
                      >
                        <Icon size={18} className="text-navy" />
                        <span className="text-sm font-medium text-navy">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Surface du bien</label>
                <div className="text-center mb-2">
                  <span className="font-display font-bold text-navy" style={{ fontSize: 28 }}>
                    {surface} m²
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={15}
                    max={200}
                    step={5}
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--navy)) 0%, hsl(var(--navy)) ${sliderPct}%, #e5e0d8 ${sliderPct}%, #e5e0d8 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 m²</span>
                    <span>200 m²</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Secteur géographique</label>
                <select
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold text-navy"
                >
                  {QUARTIERS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-3">État du bien</label>
                <div className="grid grid-cols-3 gap-2">
                  {ETAT_OPTS.map((o) => {
                    const active = etat === o.value;
                    const Icon = o.Icon;
                    return (
                      <button
                        type="button"
                        key={o.value}
                        onClick={() => setEtat(o.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          active ? "border-gold bg-gold/10" : "border-border bg-white hover:border-gold/50"
                        }`}
                      >
                        <Icon size={18} className="text-navy" />
                        <span className="text-xs font-medium text-navy">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Valeur estimée du bien (optionnel — pour calcul rendement)
                </label>
                <div className="relative">
                  <input
                    ref={valeurRef}
                    type="text"
                    inputMode="numeric"
                    value={valeur}
                    onChange={(e) => setValeur(e.target.value.replace(/[^0-9\s]/g, ""))}
                    placeholder="Ex: 180 000"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-border bg-white focus:outline-none focus:border-gold text-navy"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide si vous ne souhaitez pas calculer le rendement
                </p>
              </div>
            </div>

            {/* RÉSULTATS */}
            <div className="space-y-4">
              <div
                className="bg-white rounded-xl p-6"
                style={{ borderLeft: "4px solid #C9A96E" }}
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Loyer mensuel estimé
                </p>
                <p className="font-display text-navy" style={{ fontSize: 28, lineHeight: 1.2 }}>
                  Entre <AnimatedNum value={calc.bas} suffix=" €" /> et{" "}
                  <AnimatedNum value={calc.haut} suffix=" €" /> / mois
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Valeur centrale : <AnimatedNum value={calc.brut} suffix=" €" />/mois
                </p>

                <div className="h-px bg-gold/40 my-4" />

                <p className="text-xs text-muted-foreground mb-1">
                  Votre revenu net après honoraires de gestion (7%)
                </p>
                <p className="font-bold" style={{ color: "#16A34A", fontSize: 24 }}>
                  <AnimatedNum value={calc.net} suffix=" €" /> / mois
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Honoraires Dupuis Immobilier : <AnimatedNum value={calc.honoraires} suffix=" €" />/mois
                </p>

                <div className="h-px bg-gold/40 my-4" />

                <p className="text-xs text-muted-foreground mb-1">Revenu locatif net annuel</p>
                <p className="font-bold text-navy" style={{ fontSize: 24 }}>
                  <AnimatedNum value={calc.annuel} suffix=" €" /> / an
                </p>

                {calc.valNum > 0 && (
                  <>
                    <div className="h-px bg-gold/40 my-4" />
                    <p className="text-xs text-muted-foreground mb-2">Rendement locatif</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Brut</p>
                        <p className="text-navy text-lg">
                          <AnimatedNum value={calc.rdtBrut} decimals={2} suffix=" %" />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net après honoraires</p>
                        <p className="font-bold text-lg" style={{ color: "#16A34A" }}>
                          <AnimatedNum value={calc.rdtNet} decimals={2} suffix=" %" />
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rendement net = revenus nets / valeur du bien
                    </p>
                  </>
                )}
              </div>

              {marketTip ? (
                <div
                  key={marketTip.text}
                  className="bg-white rounded-lg p-4 border border-border animate-fade-in"
                >
                  <p className="text-sm text-navy">
                    <span className="mr-2">{marketTip.emoji}</span>
                    {marketTip.text}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => valeurRef.current?.focus()}
                  className="w-full bg-white rounded-lg p-4 border border-border text-left text-sm text-navy hover:border-gold transition-colors"
                >
                  💡 Renseignez la valeur de votre bien pour calculer le rendement
                </button>
              )}

              {/* CTA */}
              <div className="rounded-xl p-6 bg-navy text-white">
                <p className="text-sm text-white/90 mb-4">
                  Ces estimations sont basées sur les données du marché rémois 2026. Pour une
                  estimation précise et personnalisée de votre bien :
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#devis"
                    className="flex-1 text-center px-4 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors"
                  >
                    Demander une estimation précise
                  </a>
                  <a
                    href="tel:+33326000000"
                    className="flex-1 text-center px-4 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> Appeler Julien
                  </a>
                </div>
                <p className="text-xs text-white/70 mt-3 text-center">
                  ⚡ Réponse sous 24h · Estimation gratuite et sans engagement
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] italic text-muted-foreground mt-8">
            * Ces estimations sont fournies à titre indicatif et basées sur les données du marché
            locatif rémois observées en 2026. Elles ne constituent pas une offre contractuelle. Une
            visite du bien est nécessaire pour une estimation précise.
          </p>
        </div>
      </div>
    </section>
  );
}
