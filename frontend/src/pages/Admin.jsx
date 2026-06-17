import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, LogOut, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/api";

const PAY_LABELS = {
  paypal: "PayPal",
  carte_credit: "Carte de crédit",
  carte_debit: "Carte de débit",
  interac: "Virement Interac",
  comptant: "Comptant à la livraison",
  autre: "Autre",
};

const STATUS_LABELS = {
  pending: { label: "En attente", color: "bg-brand-ochre/15 text-brand-ochre" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  fulfilled: { label: "Livrée", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-gray-200 text-gray-600" },
};

const adminClient = (password) =>
  axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json", "X-Admin-Password": password },
  });

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem("mr_admin_pwd") || "");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailTesting, setEmailTesting] = useState(false);

  const fetchOrders = async (pwd) => {
    setLoading(true);
    try {
      const client = adminClient(pwd);
      const [{ data: ordersData }, { data: cfg }] = await Promise.all([
        client.get("/orders?limit=200"),
        client.get("/admin/email-config").catch(() => ({ data: null })),
      ]);
      setOrders(ordersData);
      setEmailConfig(cfg);
      setAuthed(true);
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Mot de passe incorrect");
        localStorage.removeItem("mr_admin_pwd");
        setAuthed(false);
      } else {
        toast.error("Erreur de chargement");
      }
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    setEmailTesting(true);
    try {
      const { data } = await adminClient(password).post("/admin/email-test");
      if (data.ok) {
        toast.success(`Email de test envoyé (id: ${data.id})`);
      } else {
        toast.error(`Échec : ${data.error}`);
      }
    } catch (err) {
      toast.error("Erreur lors du test");
    } finally {
      setEmailTesting(false);
    }
  };

  useEffect(() => {
    if (password) fetchOrders(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminClient(password).post("/admin/login");
      localStorage.setItem("mr_admin_pwd", password);
      await fetchOrders(password);
    } catch {
      toast.error("Mot de passe incorrect");
    } finally {
      setSubmitting(false);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("mr_admin_pwd");
    setPassword("");
    setAuthed(false);
    setOrders([]);
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await adminClient(password).patch(`/orders/${id}/status`, { status });
      setOrders((curr) => curr.map((o) => (o.id === id ? data : o)));
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const removeOrder = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await adminClient(password).delete(`/orders/${id}`);
      setOrders((curr) => curr.filter((o) => o.id !== id));
      toast.success("Commande supprimée");
    } catch {
      toast.error("Erreur de suppression");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-sand flex items-center justify-center p-6">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md rounded-3xl border border-brand-line bg-white p-8 shadow-[0_24px_60px_-20px_rgba(29,25,20,0.15)]"
          data-testid="admin-login-form"
        >
          <Link to="/" className="text-sm text-brand-muted inline-flex items-center gap-2 mb-6 hover:text-brand-ruby" data-testid="admin-back-home">
            <ArrowLeft size={14} /> Retour au site
          </Link>
          <h1 className="font-display text-3xl text-brand-ink">Espace administrateur</h1>
          <p className="text-sm text-brand-muted mt-1">Délices Mikaté Royal</p>
          <label className="block mt-6">
            <span className="text-sm font-medium text-brand-ink">Mot de passe</span>
            <input
              type="password"
              required
              data-testid="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full bg-white border border-brand-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-ruby focus:ring-4 focus:ring-brand-ruby/10"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            data-testid="admin-login-submit"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-ruby text-white py-3 text-sm font-medium hover:bg-brand-ink transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    fulfilled: orders.filter((o) => o.status === "fulfilled").length,
  };

  return (
    <div className="min-h-screen bg-brand-sand">
      <header className="border-b border-brand-line bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-brand-muted inline-flex items-center gap-2 hover:text-brand-ruby" data-testid="admin-link-home">
              <ArrowLeft size={14} /> Site
            </Link>
            <span className="text-brand-line">|</span>
            <h1 className="font-display text-2xl text-brand-ink">Admin · Commandes</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(password)}
              data-testid="admin-refresh"
              className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white text-sm px-4 py-2 hover:border-brand-ruby"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Rafraîchir
            </button>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 rounded-full bg-brand-ink text-white text-sm px-4 py-2 hover:bg-brand-ruby"
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Total commandes" value={stats.total} />
          <StatCard label="En attente" value={stats.pending} accent="text-brand-ochre" />
          <StatCard label="Livrées" value={stats.fulfilled} accent="text-green-700" />
        </div>

        {emailConfig && (
          <div className="rounded-3xl border border-brand-line bg-white p-5 mb-8 flex flex-col md:flex-row md:items-center gap-4 md:justify-between" data-testid="email-config-banner">
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted">Configuration email (Resend)</p>
              <p className="mt-1 text-brand-ink">
                Clé : <span className={emailConfig.resend_api_key_set ? "text-green-700" : "text-red-600"}>
                  {emailConfig.resend_api_key_set ? `✅ ${emailConfig.resend_api_key_prefix}` : "❌ non configurée"}
                </span>
                <span className="mx-2 text-brand-line">|</span>
                Expéditeur : <span className="text-brand-ink">{emailConfig.sender}</span>
                <span className="mx-2 text-brand-line">|</span>
                Destinataire : <span className="text-brand-ink">{emailConfig.recipient}</span>
              </p>
            </div>
            <button
              onClick={testEmail}
              disabled={emailTesting || !emailConfig.resend_api_key_set}
              data-testid="admin-email-test"
              className="inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-5 py-2 text-sm hover:bg-brand-ink disabled:opacity-60"
            >
              {emailTesting && <Loader2 size={14} className="animate-spin" />}
              Envoyer un email de test
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-brand-line bg-white p-12 text-center">
            <p className="text-brand-muted">Aucune commande pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article
                key={o.id}
                data-testid={`admin-order-${o.id}`}
                className="rounded-3xl border border-brand-line bg-white p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-xl text-brand-ink">{o.customer_name}</h3>
                      <span className={`text-[11px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1 ${STATUS_LABELS[o.status]?.color || ""}`}>
                        {STATUS_LABELS[o.status]?.label || o.status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(o.created_at).toLocaleString("fr-CA")} · Ref {o.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      data-testid={`admin-status-${o.id}`}
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="text-sm bg-white border border-brand-line rounded-full px-3 py-1.5 outline-none focus:border-brand-ruby"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="fulfilled">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                    <button
                      onClick={() => removeOrder(o.id)}
                      data-testid={`admin-delete-${o.id}`}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-brand-line text-brand-ruby hover:border-brand-ruby"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Info label="Téléphone" value={<a href={`tel:${o.phone}`} className="text-brand-ruby hover:underline">{o.phone}</a>} />
                  <Info label="Email" value={o.email ? <a href={`mailto:${o.email}`} className="text-brand-ruby hover:underline">{o.email}</a> : "—"} />
                  <Info label="Adresse" value={o.address} />
                  <Info label="Paiement préféré" value={PAY_LABELS[o.payment_method] || "Non précisé"} />
                  {o.message && <Info label="Message" value={o.message} className="md:col-span-2" />}
                </div>

                <div className="mt-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-brand-muted mb-2">Produits</p>
                  <ul className="rounded-2xl border border-brand-line divide-y divide-brand-line bg-brand-sand">
                    {o.items.map((it, k) => (
                      <li key={k} className="flex items-center justify-between px-4 py-2 text-sm">
                        <span className="text-brand-ink">{it.product_name}</span>
                        <span className="text-brand-muted">× {it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 text-xs text-brand-muted">
                  Email auto envoyé : {o.email_sent ? "✅ oui" : "⚠️ non"}
                  {o.email_error && (
                    <span className="block mt-1 text-red-600 break-words">
                      Erreur : {o.email_error}
                    </span>
                  )}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent = "text-brand-ink" }) {
  return (
    <div className="rounded-3xl border border-brand-line bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-muted">{label}</p>
      <p className={`mt-2 font-display text-4xl ${accent}`}>{value}</p>
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-brand-muted">{label}</p>
      <p className="mt-1 text-brand-ink break-words">{value}</p>
    </div>
  );
}
