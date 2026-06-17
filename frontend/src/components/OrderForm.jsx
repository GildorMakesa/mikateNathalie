import { useEffect, useState } from "react";
import { Plus, Minus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, SOCIALS } from "@/lib/api";
import { TID } from "@/constants/testIds";

const emptyForm = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  payment_method: "",
  message: "",
};

const PAYMENT_OPTIONS = [
  { value: "paypal", label: "PayPal" },
  { value: "carte_credit", label: "Carte de crédit" },
  { value: "carte_debit", label: "Carte de débit" },
  { value: "interac", label: "Virement Interac" },
  { value: "comptant", label: "Comptant à la livraison" },
  { value: "autre", label: "Autre (préciser dans le message)" },
];

export default function OrderForm({ preselected, onConsume }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]); // [{product_id, product_name, quantity}]
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (preselected) {
      addProduct(preselected);
      onConsume?.();
      const el = document.getElementById("commander");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const addProduct = (p) => {
    setItems((curr) => {
      const exists = curr.find((it) => it.product_id === p.id);
      if (exists) {
        return curr.map((it) =>
          it.product_id === p.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...curr,
        { product_id: p.id, product_name: p.name, quantity: 1 },
      ];
    });
  };

  const removeItem = (id) => setItems((curr) => curr.filter((it) => it.product_id !== id));
  const updateQty = (id, delta) =>
    setItems((curr) =>
      curr
        .map((it) => (it.product_id === id ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0)
    );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.address) {
      toast.error("Merci de remplir nom, téléphone et adresse.");
      return;
    }
    if (items.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email || null,
        address: form.address,
        message: form.message || null,
        items: items.map(({ product_id, product_name, quantity }) => ({
          product_id,
          product_name,
          quantity,
        })),
      };
      const { data } = await api.post("/orders", payload);
      toast.success(
        data.email_sent
          ? "Demande envoyée ! Nous revenons vers vous avec une soumission."
          : "Demande enregistrée ! Nous vous contactons sous peu avec une soumission."
      );
      setItems([]);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer votre demande. Réessayez ou écrivez-nous à contact@mikateroyal.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="commander" className="py-24 md:py-32 bg-white border-y border-brand-line">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Demander une soumission</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight text-balance">
              Une soumission sur mesure, <em className="not-italic text-brand-ochre">en deux clics</em>
            </h2>
            <p className="mt-5 text-brand-muted max-w-md">
              Indiquez les produits qui vous intéressent et la quantité souhaitée — nous vous reviendrons rapidement avec une soumission personnalisée.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("mr:open-nancy"));
                }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-sand px-5 py-3 text-sm text-brand-ink hover:border-brand-ruby"
                data-testid="order-nancy-cta"
              >
                Discuter avec Nancy
              </button>
              <a
                href={SOCIALS.email}
                className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-sand px-5 py-3 text-sm text-brand-ink hover:border-brand-ruby"
                data-testid="order-email-cta"
              >
                contact@mikateroyal.com
              </a>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            data-testid={TID.orderForm}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-3xl border border-brand-line bg-brand-sand p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom complet *">
                <input
                  required
                  data-testid={TID.orderName}
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Aminata D."
                />
              </Field>
              <Field label="Téléphone *">
                <input
                  required
                  data-testid={TID.orderPhone}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+1 (438) ..."
                />
              </Field>
              <Field label="Email (optionnel)">
                <input
                  type="email"
                  data-testid={TID.orderEmail}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="vous@exemple.com"
                />
              </Field>
              <Field label="Adresse de livraison *">
                <input
                  required
                  data-testid={TID.orderAddress}
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="Quartier, ville, code postal..."
                />
              </Field>
              <Field label="Mode de paiement préféré" className="md:col-span-2">
                <select
                  data-testid="order-payment-method"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">— Choisir —</option>
                  {PAYMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-brand-ink">Vos produits</label>
              <div className="mt-2 rounded-2xl border border-brand-line bg-white divide-y divide-brand-line">
                {items.length === 0 && (
                  <div className="p-4 text-sm text-brand-muted">
                    Aucun produit sélectionné. Choisissez ci-dessous ou cliquez sur « Demander une soumission » dans le catalogue.
                  </div>
                )}
                {items.map((it) => (
                  <div
                    key={it.product_id}
                    data-testid={TID.orderItemRow}
                    className="flex items-center justify-between gap-3 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-ink truncate">{it.product_name}</p>
                      <p className="text-xs text-brand-muted">Soumission sur demande</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(it.product_id, -1)}
                        className="h-8 w-8 rounded-full border border-brand-line bg-white flex items-center justify-center hover:border-brand-ruby"
                        aria-label="Réduire"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(it.product_id, 1)}
                        className="h-8 w-8 rounded-full border border-brand-line bg-white flex items-center justify-center hover:border-brand-ruby"
                        aria-label="Augmenter"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        data-testid={TID.orderItemRemove}
                        onClick={() => removeItem(it.product_id)}
                        className="h-8 w-8 rounded-full border border-brand-line bg-white flex items-center justify-center text-brand-ruby hover:border-brand-ruby"
                        aria-label="Supprimer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <label className="text-xs uppercase tracking-[0.18em] text-brand-muted">Ajouter rapidement</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      data-testid={TID.orderAddItem}
                      onClick={() => addProduct(p)}
                      className="text-xs rounded-full border border-brand-line bg-white px-3 py-1.5 hover:border-brand-ruby hover:text-brand-ruby transition-colors"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Field label="Message / précisions (optionnel)" className="mt-6">
              <textarea
                data-testid={TID.orderMessage}
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                className="input resize-none"
                placeholder="Date de l'événement, nombre d'invités, allergies, préférences..."
              />
            </Field>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs text-brand-muted max-w-sm">
                Aucun paiement maintenant. Nous vous enverrons une soumission détaillée pour validation.
              </p>
              <button
                type="submit"
                disabled={submitting}
                data-testid={TID.orderSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-7 py-3.5 text-sm font-medium hover:bg-brand-ink transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Envoi…" : "Demander une soumission"}
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E8E2D9;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          font-size: 0.925rem;
          color: #1D1914;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .input:focus { border-color: #9A1F38; box-shadow: 0 0 0 4px rgba(154,31,56,0.10); }
        .input::placeholder { color: #A89E8E; }
      `}</style>
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-brand-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
