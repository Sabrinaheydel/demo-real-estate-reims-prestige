import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LISTINGS as SEED_LISTINGS, type Listing } from "@/lib/listings";
import {
  Lock,
  LogOut,
  Pencil,
  Eye,
  Trash2,
  Plus,
  Save,
  X,
  Inbox,
  Building2,
  Check,
  Upload,
  ArrowLeft,
} from "lucide-react";
import portraitAvatar from "@/assets/photo-profil-1.jpg.asset.json";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace admin · Dupuis Immobilier" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminRoute,
});

const ADMIN_EMAIL = "admin@dupuis.fr";
const ADMIN_PASSWORD = "demo2026";

type Message = {
  id: string;
  date: string;
  firstname: string;
  email: string;
  phone: string;
  object: string;
  message: string;
  handled: boolean;
};

const SEED_MESSAGES: Message[] = [
  { id: "m1", date: "2026-06-08", firstname: "Marie", email: "marie.dubois@example.com", phone: "06 12 34 56 78", object: "Estimation", message: "Bonjour, je souhaite faire estimer mon T3 rue Cérès.", handled: false },
  { id: "m2", date: "2026-06-09", firstname: "Thomas", email: "t.lefevre@example.com", phone: "06 98 76 54 32", object: "Acheter", message: "Recherche maison 4 chambres avec jardin, secteur Clairmarais.", handled: false },
  { id: "m3", date: "2026-06-10", firstname: "Sophie", email: "sophie.m@example.com", phone: "07 11 22 33 44", object: "Louer", message: "Studio meublé proche CHU pour septembre.", handled: false },
];

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function AdminRoute() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthed(sessionStorage.getItem("admin-auth") === "1");
  }, []);
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }} />;
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "1");
      onSuccess();
    } else {
      setError("Identifiants incorrects.");
    }
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
          <h1 className="font-display text-2xl text-navy">Espace admin</h1>
        </div>
        <p className="text-sm text-foreground/60 mb-6">Connectez-vous pour gérer vos annonces.</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-navy mb-1.5">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-gold"
              placeholder="admin@dupuis.fr"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-navy mb-1.5">Mot de passe</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-5 py-3 rounded-lg bg-navy text-white font-semibold hover:bg-navy/90 transition-colors"
          >
            Se connecter
          </button>
          <p className="text-xs text-center text-foreground/50 pt-2 border-t border-border">
            Démo : <span className="font-mono">admin@dupuis.fr</span> / <span className="font-mono">demo2026</span>
          </p>
        </form>
      </div>
    </div>
  );
}

type Tab = "annonces" | "ajouter" | "messages";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [listings, setListings] = useLocalState<Listing[]>("admin-listings", SEED_LISTINGS);
  const [messages, setMessages] = useLocalState<Message[]>("admin-messages", SEED_MESSAGES);
  const [tab, setTab] = useState<Tab>("annonces");
  const [editing, setEditing] = useState<Listing | null>(null);

  const newMessagesThisWeek = messages.filter((m) => !m.handled).length;

  function saveListing(l: Listing) {
    setListings((prev) => {
      const exists = prev.some((x) => x.id === l.id);
      return exists ? prev.map((x) => (x.id === l.id ? l : x)) : [l, ...prev];
    });
    setEditing(null);
    setTab("annonces");
  }

  function deleteListing(id: string) {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl text-white hover:text-gold transition-colors">
              Dupuis <span className="text-gold italic">Immobilier</span>
            </Link>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-white/60 border-l border-white/20 pl-4">
              Espace administration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-white/20">
              <img
                src={portraitAvatar.url}
                alt="Julien Dupuis"
                className="w-10 h-10 rounded-full object-cover border-2 border-gold"
              />
              <span className="text-sm text-white/90">Bienvenue, <strong className="text-white">Julien</strong></span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10"
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-navy mb-2">Tableau de bord</h1>
        <p className="text-foreground/70 mb-8">
          <strong className="text-navy">{listings.length} annonces actives</strong>
          {" · "}
          <strong className="text-navy">{newMessagesThisWeek} formulaires reçus</strong> à traiter
        </p>

        <nav className="flex flex-wrap gap-2 mb-8">
          <TabButton active={tab === "annonces"} onClick={() => { setEditing(null); setTab("annonces"); }} icon={Building2}>
            Mes annonces
          </TabButton>
          <TabButton active={tab === "ajouter"} onClick={() => { setEditing(emptyListing()); setTab("ajouter"); }} icon={Plus}>
            Ajouter une annonce
          </TabButton>
          <TabButton active={tab === "messages"} onClick={() => setTab("messages")} icon={Inbox}>
            Formulaires reçus
            {newMessagesThisWeek > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full bg-gold text-navy font-bold">
                {newMessagesThisWeek}
              </span>
            )}
          </TabButton>
        </nav>

        {tab === "annonces" && !editing && (
          <ListingsList
            listings={listings}
            onEdit={(l) => { setEditing(l); setTab("ajouter"); }}
            onDelete={deleteListing}
          />
        )}
        {tab === "ajouter" && editing && (
          <ListingEditor
            listing={editing}
            onCancel={() => { setEditing(null); setTab("annonces"); }}
            onSave={saveListing}
          />
        )}
        {tab === "ajouter" && !editing && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <Plus size={32} className="mx-auto text-gold mb-3" />
            <p className="text-foreground/70 mb-4">Cliquez sur "Ajouter une annonce" pour commencer.</p>
            <button
              onClick={() => setEditing(emptyListing())}
              className="px-5 py-2.5 rounded-lg bg-navy text-white font-semibold"
            >
              Créer une annonce
            </button>
          </div>
        )}
        {tab === "messages" && (
          <MessagesList
            messages={messages}
            onToggle={(id) =>
              setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, handled: !m.handled } : m)))
            }
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Plus;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-navy text-white" : "bg-white text-navy border border-border hover:border-gold"
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  );
}

function emptyListing(): Listing {
  return {
    id: `new-${Date.now()}`,
    status: ["vente"],
    price: 0,
    priceLabel: "0 €",
    isRental: false,
    title: "",
    surface: 0,
    rooms: 1,
    bedrooms: 0,
    parking: false,
    features: [],
    neighborhood: "",
    description: "",
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80"],
  };
}

function ListingsList({
  listings,
  onEdit,
  onDelete,
}: {
  listings: Listing[];
  onEdit: (l: Listing) => void;
  onDelete: (id: string) => void;
}) {
  const statusLabel: Record<string, { label: string; cls: string }> = {
    vente: { label: "À vendre", cls: "bg-navy text-white" },
    location: { label: "À louer", cls: "bg-emerald-600 text-white" },
    exclusivite: { label: "Exclusivité", cls: "bg-gold text-navy" },
  };
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {listings.map((l) => (
          <div key={l.id} className="flex flex-col sm:flex-row gap-4 p-4 sm:items-center hover:bg-cream/40 transition-colors">
            <img src={l.photos[0]} alt={l.title} className="w-full sm:w-28 h-28 sm:h-20 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {l.status.map((s) => (
                  <span key={s} className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusLabel[s].cls}`}>
                    {statusLabel[s].label}
                  </span>
                ))}
              </div>
              <h3 className="font-display text-lg text-navy truncate">{l.title || "Sans titre"}</h3>
              <p className="text-sm text-foreground/60">{l.neighborhood}</p>
            </div>
            <div className="font-display text-lg text-navy sm:text-right sm:min-w-[120px]">
              {l.priceLabel}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => onEdit(l)} title="Modifier" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-gold hover:text-navy hover:border-gold transition-colors">
                <Pencil size={15} />
              </button>
              <Link to="/annonces/$id" params={{ id: l.id }} title="Voir" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-navy hover:text-white transition-colors">
                <Eye size={15} />
              </Link>
              <button onClick={() => onDelete(l.id)} title="Supprimer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <p className="p-8 text-center text-foreground/60">Aucune annonce pour le moment.</p>
        )}
      </div>
    </div>
  );
}

function ListingEditor({
  listing,
  onCancel,
  onSave,
}: {
  listing: Listing;
  onCancel: () => void;
  onSave: (l: Listing) => void;
}) {
  const [draft, setDraft] = useState<Listing>(listing);
  const [saved, setSaved] = useState(false);
  const charCount = draft.description.length;

  const statusOptions: { value: string; label: string }[] = [
    { value: "vente", label: "À vendre" },
    { value: "location", label: "À louer" },
    { value: "vendu", label: "Vendu" },
    { value: "loue", label: "Loué" },
    { value: "exclusivite", label: "Exclusivité" },
  ];
  const mainStatus = draft.status[0] ?? "vente";

  function setStatus(val: string) {
    if (val === "exclusivite") {
      setDraft({ ...draft, status: ["vente", "exclusivite"], isRental: false });
    } else if (val === "location") {
      setDraft({ ...draft, status: ["location"], isRental: true });
    } else if (val === "vendu" || val === "loue") {
      setDraft({ ...draft, status: [val === "vendu" ? "vente" : "location"], isRental: val === "loue" });
    } else {
      setDraft({ ...draft, status: ["vente"], isRental: false });
    }
  }

  function handlePhotoFile(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setDraft((d) => {
        const photos = [...d.photos];
        photos[index] = url;
        return { ...d, photos };
      });
    };
    reader.readAsDataURL(file);
  }

  function addExtraPhoto(file: File) {
    if (draft.photos.length >= 6) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, photos: [...d.photos, String(reader.result)] }));
    };
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceLabel = draft.isRental
      ? `${draft.price.toLocaleString("fr-FR")} €/mois`
      : `${draft.price.toLocaleString("fr-FR")} €`;
    setSaved(true);
    setTimeout(() => onSave({ ...draft, priceLabel }), 600);
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-border p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-navy">
          {listing.title ? "Modifier l'annonce" : "Nouvelle annonce"}
        </h2>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Check size={16} /> Enregistré
          </span>
        )}
      </div>

      <Field label="Titre du bien" required>
        <input
          type="text"
          required
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Ex : Appartement T3 avec balcon, centre-ville"
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Prix" hint={draft.isRental ? "Loyer mensuel" : "Prix de vente"}>
          <div className="relative">
            <input
              type="number"
              required
              min={0}
              value={draft.price || ""}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy font-semibold">€</span>
          </div>
        </Field>
        <Field label="Statut">
          <select
            value={
              draft.status.includes("exclusivite")
                ? "exclusivite"
                : mainStatus
            }
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" hint={`${charCount} caractères`}>
        <textarea
          rows={6}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          maxLength={2000}
          placeholder="Présentez le bien comme si vous le faisiez visiter…"
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm resize-none"
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Surface (m²)">
          <input
            type="number"
            min={0}
            value={draft.surface || ""}
            onChange={(e) => setDraft({ ...draft, surface: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
          />
        </Field>
        <Field label="Nombre de pièces">
          <input
            type="number"
            min={0}
            value={draft.rooms ?? ""}
            onChange={(e) => setDraft({ ...draft, rooms: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
          />
        </Field>
        <Field label="Nombre de chambres">
          <input
            type="number"
            min={0}
            value={draft.bedrooms ?? ""}
            onChange={(e) => setDraft({ ...draft, bedrooms: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
          />
        </Field>
      </div>

      <Field label="Quartier">
        <input
          type="text"
          value={draft.neighborhood}
          onChange={(e) => setDraft({ ...draft, neighborhood: e.target.value })}
          placeholder="Ex : Centre-ville Rue Cérès"
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-gold text-sm"
        />
      </Field>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.parking}
          onChange={(e) => setDraft({ ...draft, parking: e.target.checked })}
          className="w-5 h-5 accent-[var(--color-gold)]"
        />
        <span className="text-sm text-navy">Parking disponible</span>
      </label>

      <Field label="Photo principale" hint="Cliquez pour changer">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <img src={draft.photos[0]} alt="Aperçu principal" className="w-40 h-32 rounded-lg object-cover border border-border" />
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-navy cursor-pointer hover:border-gold">
            <Upload size={16} /> Changer la photo
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && handlePhotoFile(e.target.files[0], 0)}
            />
          </label>
        </div>
      </Field>

      <Field label="Photos supplémentaires" hint={`${Math.max(draft.photos.length - 1, 0)} / 5`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {draft.photos.slice(1).map((p, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-[4/3]">
              <img src={p} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, idx) => idx !== i + 1) })}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Supprimer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {draft.photos.length < 6 && (
            <label className="aspect-[4/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold hover:bg-cream/40 transition-colors text-sm text-foreground/60">
              <Plus size={24} className="text-gold" />
              <span>Ajouter une photo</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && addExtraPhoto(e.target.files[0])}
              />
            </label>
          )}
        </div>
      </Field>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Save size={16} /> Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-foreground/80 font-semibold hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-navy">
          {label}{required && <span className="text-gold"> *</span>}
        </span>
        {hint && <span className="text-xs text-foreground/50">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function MessagesList({
  messages,
  onToggle,
}: {
  messages: Message[];
  onToggle: (id: string) => void;
}) {
  const sorted = useMemo(() => [...messages].sort((a, b) => b.date.localeCompare(a.date)), [messages]);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-xs uppercase tracking-wider text-foreground/60">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Prénom</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Téléphone</th>
              <th className="text-left px-4 py-3">Objet</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className={`border-t border-border ${m.handled ? "opacity-60" : ""}`}>
                <td className="px-4 py-3 text-foreground/70 whitespace-nowrap">{new Date(m.date).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 font-medium text-navy">{m.firstname}</td>
                <td className="px-4 py-3"><a href={`mailto:${m.email}`} className="text-navy hover:text-gold">{m.email}</a></td>
                <td className="px-4 py-3"><a href={`tel:${m.phone}`} className="text-navy hover:text-gold">{m.phone}</a></td>
                <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded-full bg-cream text-navy text-xs font-medium">{m.object}</span></td>
                <td className="px-4 py-3 text-foreground/70 max-w-xs">{m.message}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggle(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      m.handled
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-navy text-white hover:bg-navy/90"
                    }`}
                  >
                    {m.handled ? <><Check size={13} /> Traité</> : "Marquer comme traité"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="p-8 text-center text-foreground/60">Aucun message.</p>}
      </div>
    </div>
  );
}
