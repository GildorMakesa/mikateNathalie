import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Trash2,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Mail,
  FileText,
  Copy,
  X,
  Settings as SettingsIcon,
  Bell,
  Check,
} from "lucide-react";
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

const STATUS_OPTIONS = [
  { value: "new", label: "Nouvelle demande", color: "bg-red-100 text-red-700" },
  { value: "submission_sent", label: "Soumission envoyée", color: "bg-blue-100 text-blue-700" },
  { value: "payment_received", label: "Paiement reçu", color: "bg-amber-100 text-amber-700" },
  { value: "preparing", label: "En préparation", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Livrée", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Annulée", color: "bg-gray-200 text-gray-600" },
];
const STATUS_META = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

const adminClient = (password) =>
  axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json", "X-Admin-Password": password },
  });

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem("mr_admin_pwd") || "");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [unread, setUnread] = useState(0);
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailTesting, setEmailTesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // orders | settings
  const [submissionModal, setSubmissionModal] = useState(null); // {orderId, subject, body, to}
  const pollRef = useRef(null);

  const fetchOrders = async (pwd) => {
    setLoading(true);
    try {
      const client = adminClient(pwd);
      const [{ data: ordersData }, { data: cfg }, { data: uc }] = await Promise.all([
        client.get("/orders?limit=200"),
        client.get("/admin/email-config").catch(() => ({ data: null })),
        client.get("/orders/unread-count").catch(() => ({ data: { count: 0 } })),
      ]);
      setOrders(ordersData);
      setEmailConfig(cfg);
      setUnread(uc?.count || 0);
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

  useEffect(() => {
    if (!password) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      fetchOrders(password);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for new orders every 30s
  useEffect(() => {
    if (!authed) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await adminClient(password).get("/orders/unread-count");
        if (data.count > unread) {
          toast.success(`📬 ${data.count - unread} nouvelle(s) demande(s) reçue(s)`);
          fetchOrders(password);
        } else {
          setUnread(data.count);
        }
      } catch { /* ignore poll errors */ }
    }, 30000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, unread]);

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
    setUnread(0);
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

  const markRead = async (id) => {
    try {
      const { data } = await adminClient(password).patch(`/orders/${id}/read`, {});
      setOrders((curr) => curr.map((o) => (o.id === id ? data : o)));
      setUnread((n) => Math.max(0, n - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await adminClient(password).post("/orders/mark-all-read");
      setOrders((curr) => curr.map((o) => ({ ...o, read: true })));
      setUnread(0);
      toast.success("Toutes les commandes marquées comme lues");
    } catch {
      toast.error("Erreur");
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

  const openSubmission = async (order) => {
    try {
      const { data } = await adminClient(password).get(`/orders/${order.id}/submission`);
      setSubmissionModal({ orderId: order.id, ...data });
    } catch {
      toast.error("Impossible de générer la soumission");
    }
  };

  const testEmail = async () => {
    setEmailTesting(true);
    try {
      const { data } = await adminClient(password).post("/admin/email-test");
      if (data.ok) toast.success("Email de test envoyé ✅");
      else toast.error(`Échec : ${data.error}`);
    } catch {
      toast.error("Erreur lors du test");
    } finally {
      setEmailTesting(false);
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

  return (
    <div className="min-h-screen bg-brand-sand">
      <header className="border-b border-brand-line bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-sm text-brand-muted inline-flex items-center gap-1 hover:text-brand-ruby" data-testid="admin-link-home">
              <ArrowLeft size={14} /> Site
            </Link>
            <span className="text-brand-line hidden sm:inline">|</span>
            <h1 className="font-display text-xl md:text-2xl text-brand-ink truncate">Admin · Délices Mikaté Royal</h1>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={markAllRead}
                data-testid="admin-mark-all-read"
                className="relative inline-flex items-center gap-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm px-4 py-2 hover:bg-red-100"
              >
                <Bell size={14} />
                <span>{unread} nouvelle{unread > 1 ? "s" : ""}</span>
              </button>
            )}
            <button
              onClick={() => fetchOrders(password)}
              data-testid="admin-refresh"
              className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white text-sm px-4 py-2 hover:border-brand-ruby"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden md:inline">Rafraîchir</span>
            </button>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 rounded-full bg-brand-ink text-white text-sm px-4 py-2 hover:bg-brand-ruby"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-10 pb-3 flex items-center gap-1">
          <Tab active={activeTab === "orders"} onClick={() => setActiveTab("orders")} testId="tab-orders">
            Commandes
          </Tab>
          <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")} testId="tab-settings">
            <SettingsIcon size={13} className="mr-1.5" /> Paramètres
          </Tab>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        {activeTab === "orders" ? (
          <OrdersPanel
            orders={orders}
            emailConfig={emailConfig}
            emailTesting={emailTesting}
            onTestEmail={testEmail}
            onUpdateStatus={updateStatus}
            onMarkRead={markRead}
            onRemove={removeOrder}
            onGenerateSubmission={openSubmission}
          />
        ) : (
          <SettingsPanel password={password} />
        )}
      </main>

      {submissionModal && (
        <SubmissionModal
          data={submissionModal}
          onClose={() => setSubmissionModal(null)}
          onMarkSent={async () => {
            await updateStatus(submissionModal.orderId, "submission_sent");
            setSubmissionModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Tabs ---------------- */
function Tab({ active, onClick, children, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm transition-colors ${
        active
          ? "bg-brand-ink text-white"
          : "text-brand-muted hover:text-brand-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- Orders Panel ---------------- */
function OrdersPanel({
  orders,
  emailConfig,
  emailTesting,
  onTestEmail,
  onUpdateStatus,
  onMarkRead,
  onRemove,
  onGenerateSubmission,
}) {
  const stats = useMemo(() => {
    const by = (s) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      new: by("new"),
      submission_sent: by("submission_sent"),
      delivered: by("delivered"),
    };
  }, [orders]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Nouvelles" value={stats.new} accent="text-red-700" />
        <StatCard label="Soumissions envoyées" value={stats.submission_sent} accent="text-blue-700" />
        <StatCard label="Livrées" value={stats.delivered} accent="text-green-700" />
      </div>

      {emailConfig && (
        <div className="rounded-3xl border border-brand-line bg-white p-5 mb-8 flex flex-col md:flex-row md:items-center gap-4 md:justify-between" data-testid="email-config-banner">
          <div className="text-sm min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted">Configuration email (Resend)</p>
            <p className="mt-1 text-brand-ink truncate">
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
            onClick={onTestEmail}
            disabled={emailTesting || !emailConfig.resend_api_key_set}
            data-testid="admin-email-test"
            className="inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-5 py-2 text-sm hover:bg-brand-ink disabled:opacity-60 shrink-0"
          >
            {emailTesting && <Loader2 size={14} className="animate-spin" />}
            <Mail size={14} /> Email de test
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
            <OrderCard
              key={o.id}
              order={o}
              onUpdateStatus={onUpdateStatus}
              onMarkRead={onMarkRead}
              onRemove={onRemove}
              onGenerateSubmission={onGenerateSubmission}
            />
          ))}
        </div>
      )}
    </>
  );
}

function OrderCard({ order: o, onUpdateStatus, onMarkRead, onRemove, onGenerateSubmission }) {
  const meta = STATUS_META[o.status] || { label: o.status, color: "bg-gray-100 text-gray-600" };
  return (
    <article
      data-testid={`admin-order-${o.id}`}
      className={`rounded-3xl border bg-white p-6 transition-colors ${
        !o.read ? "border-red-300 ring-1 ring-red-100" : "border-brand-line"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {!o.read && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] rounded-full bg-red-600 text-white px-2 py-0.5">
                ● Non lu
              </span>
            )}
            <h3 className="font-display text-xl text-brand-ink truncate">{o.customer_name}</h3>
            <span className={`text-[11px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1 ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            {new Date(o.created_at).toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short" })} · Réf {o.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            data-testid={`admin-status-${o.id}`}
            value={STATUS_META[o.status] ? o.status : "new"}
            onChange={(e) => onUpdateStatus(o.id, e.target.value)}
            className="text-sm bg-white border border-brand-line rounded-full px-3 py-1.5 outline-none focus:border-brand-ruby"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => onGenerateSubmission(o)}
            data-testid={`admin-generate-${o.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink text-white text-sm px-3 py-1.5 hover:bg-brand-ruby"
          >
            <FileText size={13} /> Générer la soumission
          </button>
          {!o.read && (
            <button
              onClick={() => onMarkRead(o.id)}
              data-testid={`admin-mark-read-${o.id}`}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-full border border-brand-line text-sm hover:border-brand-ruby"
            >
              <Check size={13} /> Marquer lu
            </button>
          )}
          <button
            onClick={() => onRemove(o.id)}
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
        <Info label="Courriel" value={o.email ? <a href={`mailto:${o.email}`} className="text-brand-ruby hover:underline">{o.email}</a> : "—"} />
        <Info label="Adresse" value={o.address} className="md:col-span-2" />
        <Info label="Paiement préféré" value={PAY_LABELS[o.payment_method] || "Non précisé"} />
        <Info label="Date" value={new Date(o.created_at).toLocaleString("fr-CA")} />
        {o.message && <Info label="Message" value={o.message} className="md:col-span-2" />}
      </div>

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-brand-muted mb-2">Produits commandés</p>
        <ul className="rounded-2xl border border-brand-line divide-y divide-brand-line bg-brand-sand">
          {o.items.map((it, k) => (
            <li key={k} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-brand-ink">{it.product_name}</span>
              <span className="text-brand-muted">× {it.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-xs text-brand-muted">
        <p>
          Email reçu par vous : {o.email_sent ? "✅" : "⚠️"}
          {o.email_error && <span className="text-red-600 ml-2">{o.email_error}</span>}
        </p>
        {o.email && (
          <p>
            Confirmation envoyée au client : {o.client_email_sent ? "✅" : "⚠️"}
            {o.client_email_error && <span className="text-red-600 ml-2">{o.client_email_error}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

/* ---------------- Submission Modal ---------------- */
function SubmissionModal({ data, onClose, onMarkSent }) {
  const [subject, setSubject] = useState(data.subject);
  const [body, setBody] = useState(data.body);
  const [to, setTo] = useState(data.to || "");

  const copyAll = async () => {
    const text = `Sujet : ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Soumission copiée");
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 bg-brand-ink/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-3xl border border-brand-line max-w-3xl w-full p-6 md:p-8 my-8"
        onClick={(e) => e.stopPropagation()}
        data-testid="submission-modal"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-2xl text-brand-ink">Soumission générée</h3>
            <p className="text-xs text-brand-muted mt-1">Modifiez si besoin, puis copiez ou envoyez.</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-brand-line hover:border-brand-ruby" data-testid="submission-close">
            <X size={16} />
          </button>
        </div>

        <label className="block text-sm">
          <span className="text-brand-ink font-medium">Destinataire</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1.5 w-full bg-white border border-brand-line rounded-xl px-4 py-2.5 outline-none focus:border-brand-ruby"
            placeholder="client@example.com"
            data-testid="submission-to"
          />
        </label>

        <label className="block text-sm mt-4">
          <span className="text-brand-ink font-medium">Sujet</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1.5 w-full bg-white border border-brand-line rounded-xl px-4 py-2.5 outline-none focus:border-brand-ruby"
            data-testid="submission-subject"
          />
        </label>

        <label className="block text-sm mt-4">
          <span className="text-brand-ink font-medium">Message</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="mt-1.5 w-full bg-brand-sand border border-brand-line rounded-xl px-4 py-3 outline-none focus:border-brand-ruby font-mono text-[13px] leading-relaxed"
            data-testid="submission-body"
          />
        </label>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <button onClick={copyAll} data-testid="submission-copy" className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm hover:border-brand-ruby">
            <Copy size={14} /> Copier
          </button>
          <a href={mailto} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-ink text-white px-5 py-2.5 text-sm hover:bg-brand-ruby" data-testid="submission-mailto">
            <Mail size={14} /> Ouvrir dans messagerie
          </a>
          <button onClick={onMarkSent} data-testid="submission-mark-sent" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-ruby text-white px-5 py-2.5 text-sm hover:bg-brand-ink">
            <Check size={14} /> Marquer « Soumission envoyée »
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Settings Panel ---------------- */
function SettingsPanel({ password }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminClient(password).get("/admin/settings").then((r) => setData(r.data)).catch(() => toast.error("Impossible de charger"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: saved } = await adminClient(password).put("/admin/settings", data);
      setData(saved);
      toast.success("Paramètres enregistrés");
    } catch {
      toast.error("Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return <div className="rounded-3xl border border-brand-line bg-white p-12 text-center text-brand-muted">Chargement...</div>;
  }

  return (
    <form onSubmit={save} className="max-w-3xl rounded-3xl border border-brand-line bg-white p-6 md:p-8" data-testid="settings-form">
      <h2 className="font-display text-2xl text-brand-ink">Paramètres Interac</h2>
      <p className="text-sm text-brand-muted mt-1">
        Ces valeurs apparaissent automatiquement dans le modèle de soumission généré.
      </p>

      <div className="mt-6 space-y-5">
        <Field label="Adresse de paiement Interac">
          <input
            data-testid="settings-interac-email"
            value={data.interac_email}
            onChange={(e) => setData({ ...data, interac_email: e.target.value })}
            className="s-input"
            placeholder="contact@mikateroyal.com"
          />
        </Field>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            data-testid="settings-auto-deposit"
            checked={data.interac_auto_deposit}
            onChange={(e) => setData({ ...data, interac_auto_deposit: e.target.checked })}
            className="mt-1 h-4 w-4 accent-brand-ruby"
          />
          <span>
            <span className="font-medium text-brand-ink">Dépôt automatique Interac activé</span>
            <span className="block text-xs text-brand-muted">
              Si activé, le modèle indique « aucun mot de passe requis » et masque question / réponse.
            </span>
          </span>
        </label>

        {!data.interac_auto_deposit && (
          <>
            <Field label="Question de sécurité">
              <input
                data-testid="settings-interac-question"
                value={data.interac_question}
                onChange={(e) => setData({ ...data, interac_question: e.target.value })}
                className="s-input"
              />
            </Field>
            <Field label="Réponse">
              <input
                data-testid="settings-interac-answer"
                value={data.interac_answer}
                onChange={(e) => setData({ ...data, interac_answer: e.target.value })}
                className="s-input"
              />
            </Field>
          </>
        )}

        <Field label="Note client (instruction pour le virement)">
          <textarea
            data-testid="settings-interac-note"
            value={data.interac_note}
            onChange={(e) => setData({ ...data, interac_note: e.target.value })}
            rows={3}
            className="s-input resize-none"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={saving}
        data-testid="settings-save"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-6 py-2.5 text-sm hover:bg-brand-ink disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Enregistrer
      </button>

      <style>{`
        .s-input { width:100%; background:#fff; border:1px solid #E8E2D9; border-radius:14px; padding:.625rem .9rem; font-size:.925rem; color:#1D1914; outline:none; }
        .s-input:focus { border-color:#9A1F38; box-shadow:0 0 0 4px rgba(154,31,56,.1); }
      `}</style>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-brand-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
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
