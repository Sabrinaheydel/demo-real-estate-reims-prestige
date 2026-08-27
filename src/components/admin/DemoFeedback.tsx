import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitDemoFeedbackFn } from "@/lib/crm.functions";
import { track } from "@/lib/analytics";
import { MessageSquare, X, Star } from "lucide-react";

export default function DemoFeedback() {
  const submit = useServerFn(submitDemoFeedbackFn);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (rating < 1) {
      setError("Choisissez une note de 1 à 5.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submit({ data: { rating, comment: comment.trim() || undefined, email: email.trim() || undefined } });
      track("feedback_submitted", { rating });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gold text-navy font-semibold"
      >
        <MessageSquare size={14} /> Votre avis
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-sm bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-display text-lg text-navy">Votre avis sur la démo</h4>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-1 rounded hover:bg-navy/10">
                <X size={16} />
              </button>
            </div>

            {done ? (
              <div className="py-3">
                <p className="text-sm text-emerald-700 font-semibold">Merci, votre avis a bien été enregistré.</p>
                <button onClick={() => setOpen(false)} className="mt-4 px-4 py-2 rounded-lg bg-navy text-white text-sm">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-1.5 my-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      aria-label={`Note ${n} sur 5`}
                      className={`p-1.5 rounded ${n <= rating ? "text-gold" : "text-foreground/25"}`}
                    >
                      <Star size={22} fill={n <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Commentaire (optionnel)"
                  className="w-full text-sm border border-border rounded px-2 py-2 mb-2"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optionnel)"
                  className="w-full text-sm border border-border rounded px-2 py-2"
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <button
                  onClick={send}
                  disabled={busy}
                  className="mt-3 w-full px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? "Envoi…" : "Envoyer mon avis"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
