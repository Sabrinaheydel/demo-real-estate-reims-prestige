import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, MailCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion · Dupuis Immobilier" },
      { name: "description", content: "Accès sécurisé à l'espace de gestion Dupuis Immobilier." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Connexion · Dupuis Immobilier" },
      { property: "og:description", content: "Accès sécurisé à l'espace de gestion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId(null);
    setSent(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-navy mb-6">
          <ArrowLeft size={14} /> Retour au site
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-navy text-gold flex items-center justify-center">
            <Lock size={18} />
          </div>
          <h1 className="font-display text-2xl text-navy">Connexion sécurisée</h1>
        </div>

        {userId ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-foreground/70">Vous êtes connecté.</p>
            <p className="text-xs text-foreground/60">
              Identifiant utilisateur :{" "}
              <code className="px-1.5 py-0.5 rounded bg-cream text-navy break-all">{userId}</code>
            </p>
            <div className="flex gap-3">
              <Link to="/admin" className="px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold">
                Ouvrir l'espace de gestion
              </Link>
              <button onClick={signOut} className="px-5 py-2.5 rounded-lg bg-gray-100 text-sm font-semibold">
                Se déconnecter
              </button>
            </div>
          </div>
        ) : sent ? (
          <div className="mt-6 flex flex-col items-center text-center gap-3">
            <MailCheck size={36} className="text-emerald-600" />
            <p className="text-sm text-foreground/80">
              Lien de connexion envoyé à <strong className="text-navy">{email}</strong>. Ouvrez-le depuis cet
              appareil pour finaliser la connexion.
            </p>
            <button onClick={() => setSent(false)} className="text-xs text-foreground/60 underline">
              Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground/60 mb-6 mt-2">
              Recevez un lien de connexion à usage unique par email. Aucun mot de passe à retenir.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-navy mb-1.5">Email professionnel</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-gold"
                  placeholder="vous@exemple.fr"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full px-5 py-3 rounded-lg bg-navy text-white font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60"
              >
                {busy ? "Envoi…" : "Recevoir le lien de connexion"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
