import { useEffect, useMemo, useRef, useState } from "react";

const DURATIONS = [10, 15, 20, 25, 30];

function formatEuro(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

function useCounterUp(value: number, duration = 400) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = display;
    fromRef.current = from;
    startRef.current = null;
    const target = value;
    if (from === target) return;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}

function AnimatedEuro({ value, className }: { value: number; className?: string }) {
  const d = useCounterUp(value);
  return <span className={className}>{formatEuro(d)}</span>;
}

export function LoanSimulator() {
  const [price, setPrice] = useState(250000);
  const [downPayment, setDownPayment] = useState(25000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(3.5);
  const insuranceRate = 0.34;
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [income, setIncome] = useState<string>("");
  const [showTable, setShowTable] = useState(false);

  const borrowed = Math.max(0, price - downPayment);
  const downPct = price > 0 ? (downPayment / price) * 100 : 0;

  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  const loanMonthly = useMemo(() => {
    if (borrowed <= 0) return 0;
    if (monthlyRate === 0) return borrowed / months;
    return (borrowed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }, [borrowed, monthlyRate, months]);

  const insuranceMonthly = (borrowed * insuranceRate) / 100 / 12;
  const totalMonthly = loanMonthly + (includeInsurance ? insuranceMonthly : 0);
  const creditCost = loanMonthly * months - borrowed;
  const insuranceCost = insuranceMonthly * months;
  const notaryFees = price * 0.08;
  const totalOperation =
    price + creditCost + notaryFees + (includeInsurance ? insuranceCost : 0);

  const amortization = useMemo(() => {
    const rows: { year: number; remaining: number; interestYear: number; principalYear: number; monthly: number }[] = [];
    let remaining = borrowed;
    for (let y = 1; y <= years; y++) {
      let interestYear = 0;
      let principalYear = 0;
      for (let m = 0; m < 12; m++) {
        const interest = remaining * monthlyRate;
        const principal = Math.min(remaining, loanMonthly - interest);
        interestYear += interest;
        principalYear += principal;
        remaining = Math.max(0, remaining - principal);
      }
      rows.push({ year: y, remaining, interestYear, principalYear, monthly: loanMonthly });
    }
    return rows;
  }, [borrowed, years, monthlyRate, loanMonthly]);

  const incomeNum = parseFloat(income.replace(/\s/g, "").replace(",", ".")) || 0;
  const capacity = incomeNum * 0.35;
  const pctOfIncome = incomeNum > 0 ? (totalMonthly / incomeNum) * 100 : 0;
  let capacityStatus: "ok" | "warn" | "bad" | null = null;
  if (incomeNum > 0) {
    if (totalMonthly <= capacity) capacityStatus = "ok";
    else if (totalMonthly <= capacity * 1.1) capacityStatus = "warn";
    else capacityStatus = "bad";
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-10"
      style={{ background: "#FAF7F2", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
    >
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-navy mb-2">
          🏦 Simulez votre prêt immobilier
        </h2>
        <p className="text-foreground/60 text-sm">
          Calculez vos mensualités en temps réel — taux du marché juin 2026
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Prix */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Prix du bien</label>
          <div className="font-display text-[28px] font-bold text-navy mb-2 leading-none">
            <AnimatedEuro value={price} />
          </div>
          <input
            type="range"
            min={50000}
            max={800000}
            step={5000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)] h-11"
          />
          <div className="flex justify-between text-xs text-foreground/50 mt-1">
            <span>50 000 €</span>
            <span>800 000 €</span>
          </div>
        </div>

        {/* Apport */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Votre apport personnel</label>
          <div className="font-display text-[28px] font-bold text-navy mb-1 leading-none">
            <AnimatedEuro value={downPayment} />
            <span className="text-base font-normal text-foreground/60 ml-2">
              — soit {downPct.toFixed(0)}% du prix
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={200000}
            step={1000}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)] h-11"
          />
          <div className="relative mt-3 h-2 rounded-full bg-gray-200 overflow-visible">
            <div
              className="absolute inset-y-0 left-0 bg-navy rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, downPct)}%` }}
            />
            <div
              className="absolute -top-1 h-4 w-0.5 bg-gold"
              style={{ left: "20%" }}
              aria-hidden
            />
          </div>
          <div className="flex justify-between text-[11px] text-foreground/50 mt-1">
            <span>0%</span>
            <span className="text-gold font-medium">Apport idéal 20%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-navy mb-3">Durée du prêt</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setYears(d)}
                className={`px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                  years === d
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-navy border-border hover:border-gold"
                }`}
              >
                {d} ans
              </button>
            ))}
          </div>
        </div>

        {/* Taux */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Taux d'intérêt annuel</label>
          <div className="font-display text-[28px] font-bold text-navy mb-2 leading-none">
            {rate.toFixed(1).replace(".", ",")} %
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)] h-11"
          />
          <p className="text-[11px] text-foreground/50 mt-1">
            Taux indicatif — taux moyen constaté juin 2026
          </p>
        </div>

        {/* Assurance */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-navy mb-2">
            Taux assurance emprunteur
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-display text-xl font-bold text-navy">0,34 %</span>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInsurance}
                onChange={(e) => setIncludeInsurance(e.target.checked)}
                className="accent-[var(--color-gold)]"
              />
              Inclure dans le calcul
            </label>
          </div>
          <p className="text-[11px] text-foreground/50 mt-1">
            Taux moyen constaté. Peut varier selon votre profil.
          </p>
        </div>
      </div>

      {/* Résultats */}
      <div className="mt-10 space-y-5">
        <div
          className="bg-white rounded-xl p-6 border-l-4"
          style={{ borderLeftColor: "#C9A96E" }}
        >
          <p className="text-sm text-foreground/60 mb-1">Mensualité totale estimée</p>
          <div className="font-display text-3xl sm:text-4xl font-bold text-navy">
            <AnimatedEuro value={totalMonthly} />
            <span className="text-base font-normal text-foreground/60"> / mois</span>
          </div>
          {includeInsurance && (
            <p className="text-sm text-foreground/60 mt-1">
              dont <AnimatedEuro value={insuranceMonthly} /> d'assurance/mois
            </p>
          )}
          <div className="h-px bg-gold/40 my-5" />

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-foreground/60 mb-1">Montant emprunté</p>
              <div className="font-display text-xl font-bold text-navy">
                <AnimatedEuro value={borrowed} />
              </div>
            </div>
            <div>
              <p className="text-xs text-foreground/60 mb-1">Coût total du crédit</p>
              <div className="font-display text-xl font-bold" style={{ color: "#DC2626" }}>
                <AnimatedEuro value={creditCost} />
              </div>
              <p className="text-[11px] text-foreground/50">Intérêts uniquement</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60 mb-1">Frais de notaire estimés</p>
              <div className="font-display text-xl font-bold" style={{ color: "#F87321" }}>
                <AnimatedEuro value={notaryFees} />
              </div>
              <p className="text-[11px] text-foreground/50">~8% pour bien ancien</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60 mb-1">Coût total de l'opération</p>
              <div className="font-display text-xl font-bold text-navy">
                <AnimatedEuro value={totalOperation} />
              </div>
              <p className="text-[11px] text-foreground/50">
                Bien + crédit + notaire + assurance
              </p>
            </div>
          </div>
        </div>

        {/* Capacité */}
        <div className="rounded-lg p-5" style={{ background: "#FAF7F2" }}>
          <h3 className="font-display text-lg text-navy mb-2">Vérifiez votre capacité</h3>
          <p className="text-sm text-foreground/70 mb-4">
            Pour que votre dossier soit accepté par les banques, votre mensualité ne doit pas
            dépasser 35% de vos revenus nets.
          </p>
          <label className="block">
            <span className="block text-sm font-medium text-navy mb-2">
              Vos revenus mensuels nets
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 3 500"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold"
            />
          </label>

          {capacityStatus === null && (
            <p className="text-sm text-foreground/60 mt-3">
              💡 Entrez vos revenus pour vérifier votre capacité d'emprunt
            </p>
          )}
          {capacityStatus && (
            <div
              className="mt-4 p-4 rounded-lg transition-opacity duration-200"
              style={{
                background:
                  capacityStatus === "ok"
                    ? "#ECFDF5"
                    : capacityStatus === "warn"
                    ? "#FEF3C7"
                    : "#FEE2E2",
              }}
            >
              {capacityStatus === "ok" && (
                <>
                  <p className="font-semibold text-navy">🟢 Votre profil est compatible</p>
                  <p className="text-sm text-foreground/80 mt-1">
                    Mensualité : {formatEuro(totalMonthly)} = {pctOfIncome.toFixed(1)}% de vos
                    revenus
                  </p>
                  <p className="text-sm text-foreground/80">
                    Marge restante : {formatEuro(capacity - totalMonthly)}/mois
                  </p>
                </>
              )}
              {capacityStatus === "warn" && (
                <>
                  <p className="font-semibold text-navy">🟡 Profil limite</p>
                  <p className="text-sm text-foreground/80 mt-1">
                    Mensualité : {formatEuro(totalMonthly)} = {pctOfIncome.toFixed(1)}% de vos
                    revenus
                  </p>
                  <p className="text-sm text-foreground/80">
                    Un co-emprunteur ou un apport plus élevé améliorerait votre dossier.
                  </p>
                </>
              )}
              {capacityStatus === "bad" && (
                <>
                  <p className="font-semibold text-navy">🔴 Dépasse votre capacité</p>
                  <p className="text-sm text-foreground/80 mt-1">
                    Mensualité : {formatEuro(totalMonthly)} = {pctOfIncome.toFixed(1)}% de vos
                    revenus
                  </p>
                  <p className="text-sm text-foreground/80">
                    Augmentez votre apport ou choisissez un bien moins cher.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <SimulationToCrm
          calculator="loan"
          signature={[price, downPayment, years, rate, includeInsurance, incomeNum].join("|")}
          leadScore={
            capacityStatus === "ok" ? 85 : capacityStatus === "warn" ? 65 : capacityStatus === "bad" ? 40 : 50
          }
          details={{
            "Prix du bien": `${Math.round(price)} €`,
            Apport: `${Math.round(downPayment)} €`,
            "Montant emprunté": `${Math.round(borrowed)} €`,
            Durée: `${years} ans`,
            Taux: `${rate.toFixed(1)} %`,
            "Assurance incluse": includeInsurance,
            "Mensualité totale": `${Math.round(totalMonthly)} €`,
            "Coût du crédit": `${Math.round(creditCost)} €`,
            "Frais de notaire": `${Math.round(notaryFees)} €`,
            "Revenu mensuel net saisi": incomeNum > 0 ? `${Math.round(incomeNum)} €` : null,
            "Statut capacité":
              capacityStatus === "ok"
                ? "Compatible"
                : capacityStatus === "warn"
                  ? "Profil limite"
                  : capacityStatus === "bad"
                    ? "Dépasse la capacité"
                    : "Non renseigné",
          }}
        />

        {/* Tableau amortissement */}

        <div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="text-sm text-navy underline hover:text-gold"
          >
            {showTable
              ? "Masquer le tableau ↑"
              : "📊 Voir le tableau d'amortissement (optionnel)"}
          </button>
          {showTable && (
            <div className="mt-4 overflow-x-auto animate-accordion-down">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="px-3 py-2 text-left">Année</th>
                    <th className="px-3 py-2 text-right">Capital restant</th>
                    <th className="px-3 py-2 text-right">Intérêts payés</th>
                    <th className="px-3 py-2 text-right">Capital remboursé</th>
                    <th className="px-3 py-2 text-right">Mensualité</th>
                  </tr>
                </thead>
                <tbody>
                  {amortization.slice(0, 30).map((r, i) => {
                    const isEdge = i === 0 || i === amortization.length - 1;
                    return (
                      <tr
                        key={r.year}
                        className={`${i % 2 ? "bg-[#FAF7F2]" : "bg-white"} ${
                          isEdge ? "font-semibold" : ""
                        }`}
                      >
                        <td className="px-3 py-2">{r.year}</td>
                        <td className="px-3 py-2 text-right">{formatEuro(r.remaining)}</td>
                        <td className="px-3 py-2 text-right">{formatEuro(r.interestYear)}</td>
                        <td className="px-3 py-2 text-right">{formatEuro(r.principalYear)}</td>
                        <td className="px-3 py-2 text-right">{formatEuro(r.monthly)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-xl p-6 sm:p-8 bg-navy text-white">
          <p className="text-white/90 mb-5 leading-relaxed">
            Cette simulation est un premier aperçu. Pour un plan de financement personnalisé,
            Julien peut vous mettre en relation avec ses partenaires bancaires.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#recherche"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition-colors"
            >
              Trouver mon bien idéal
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/60 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Parler à Julien
            </a>
          </div>
          <p className="text-xs text-white/70 mt-4">
            ⚡ Simulation sans engagement · Réponse sous 24h
          </p>
        </div>

        <p className="text-[11px] italic text-foreground/50 leading-relaxed">
          * Simulation fournie à titre indicatif basée sur un taux fixe. Ne constitue pas une
          offre de prêt. Les taux réels peuvent varier selon votre profil et l'établissement
          prêteur. Frais de notaire calculés pour un bien ancien (8%). Consultez un courtier ou
          votre banque pour une offre personnalisée.
        </p>
      </div>
    </div>
  );
}
