import { useEffect, useState } from "react";
import { Plus, Minus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, SOCIALS } from "@/lib/api";
import { TID } from "@/constants/testIds";

const formatCAD = (n) => new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);

const emptyForm = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  payment_method: "",
  message: "",
};

const emptyEvent = {
  event_type: "",
  attendees: "",
  event_date: "",
  comments: "",
};

const PAYMENT_OPTIONS = [
  { value: "interac", label: "Virement Interac (recommandé)" },
  { value: "paypal", label: "PayPal" },
  { value: "carte_credit", label: "Carte de crédit" },
  { value: "carte_debit", label: "Carte de débit" },
  { value: "comptant", label: "Comptant à la livraison" },
  { value: "autre", label: "Autre (préciser dans le message)" },
];

const EVENT_TYPES = [
  "Mariage",
  "Baptême",
  "Anniversaire",
  "Église",
  "Réunion familiale",
  "Événement corporatif",
  "Autre",
];

export default function OrderForm({ preselected, onConsume, mode = "regular", onSwitchMode }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]); // {product_id, product_name, quantity, option_label, unit_price_cad}
  const [form, setForm] = useState(emptyForm);
  const [eventInfo, setEventInfo] = useState(emptyEvent);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (preselected?.product && preselected?.option) {
      addItem(preselected.product, preselected.option);
      onConsume?.();
      document.getElementById(mode === "event" ? "evenements" : "commander")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const addItem = (p, opt) => {
    const key = `${p.id}::${opt.label}`;
    setItems((curr) => {
      const exists = curr.find((it) => `${it.product_id}::${it.option_label}` === key);
      if (exists) {
        return curr.map((it) =>
          `${it.product_id}::${it.option_label}` === key ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...curr,
        {
          product_id: p.id,
          product_name: p.name,
          option_label: opt.label,
          unit_price_cad: opt.price_cad,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (key) =>
    setItems((curr) => curr.filter((it) => `${it.product_id}::${it.option_label}` !== key));

  const updateQty = (key, delta) =>
    setItems((curr) =>
      curr
        .map((it) =>
          `${it.product_id}::${it.option_label}` === key ? { ...it, quantity: it.quantity + delta } : it
        )
        .filter((it) => it.quantity > 0)
    );

  const subtotal = items.reduce((s, it) => s + it.unit_price_cad * it.quantity, 0);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onChangeEvent = (e) => setEventInfo({ ...eventInfo, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.address) {
      toast.error("Merci de remplir nom, téléphone et adresse.");
      return;
    }
    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un produit.");
      return;
    }
    if (mode === "event" && !eventInfo.event_type) {
      toast.error("Veuillez préciser le type d'événement.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email || null,
        address: form.address,
        payment_method: form.payment_method || null,
        message: form.message || null,
        order_type: mode,
        items: items.map(({ product_id, product_name, quantity, option_label, unit_price_cad }) => ({
          product_id,
          product_name,
          quantity,
          option_label,
          unit_price_cad,
        })),
      };
      if (mode === "event") {
        payload.event_info = {
          event_type: eventInfo.event_type,
          attendees: eventInfo.attendees ? Number(eventInfo.attendees) : null,
          event_date: eventInfo.event_date || null,
          comments: eventInfo.comments || null,
        };
      }
      const { data } = await api.post("/orders", payload);
      toast.success(
        mode === "event"
          ? "Demande envoyée ! Notre équipe vous reviendra avec une soumission personnalisée."
          : data.email_sent
          ? "Commande envoyée ! Une confirmation vous attend dans votre boîte courriel."
          : "Commande enregistrée ! Nous vous contactons sous peu."
      );
      setItems([]);
      setForm(emptyForm);
      setEventInfo(emptyEvent);
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer votre demande. Réessayez ou écrivez-nous à contact@mikateroyal.com.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEvent = mode === "event";
  const sectionId = isEvent ? "evenements" : "commander";

  return (
    <section id={sectionId} className={`py-24 md:py-32 ${isEvent ? "bg-brand-ink text-brand-sand" : "bg-white border-y border-brand-line"}`}>
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold ${isEvent ? "text-brand-ochre" : "text-brand-ruby"}`}>
              {isEvent ? "🎉 Événements et réceptions" : "Commander maintenant"}
            </p>
            <h2 className={`mt-3 font-display text-4xl sm:text-5xl tracking-tight text-balance ${isEvent ? "" : "text-brand-ink"}`}>
              {isEvent ? (
                <>Soumission <em className="not-italic text-brand-ochre">personnalisée</em></>
              ) : (
                <>Votre commande, <em className="not-italic text-brand-ochre">en quelques clics</em></>
              )}
            </h2>
            <p className={`mt-5 max-w-md ${isEvent ? "text-brand-sand/80" : "text-brand-muted"}`}>
              {isEvent ? (
                <>Pour vos mariages, baptêmes, anniversaires, événements d'église ou rencontres familiales — nous adaptons les quantités à vos besoins.</>
              ) : (
                <>Choisissez vos produits avec leurs prix, remplissez le formulaire et recevez votre confirmation par courriel.</>
              )}
            </p>

            {isEvent && (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {["Mariage", "Baptême", "Anniversaire", "Réunion familiale", "Église et communauté", "Événement corporatif"].map((e) => (
                  <li key={e} className="flex items-center gap-2"><span className="text-brand-ochre">✓</span>{e}</li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("mr:open-nancy"))}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm ${
                  isEvent
                    ? "border-white/20 bg-white/10 hover:border-brand-ochre"
                    : "border-brand-line bg-brand-sand text-brand-ink hover:border-brand-ruby"
                }`}
              >
                Discuter avec Nancy
              </button>
              <a
                href={SOCIALS.email}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm ${
                  isEvent
                    ? "border-white/20 bg-white/10 hover:border-brand-ochre"
                    : "border-brand-line bg-brand-sand text-brand-ink hover:border-brand-ruby"
                }`}
              >
                contact@mikateroyal.com
              </a>
            </div>

            {onSwitchMode && (
              <p className={`mt-6 text-xs ${isEvent ? "text-brand-sand/60" : "text-brand-muted"}`}>
                {isEvent ? "Commande régulière ? " : "Pour un événement ou un grand groupe ? "}
                <button onClick={onSwitchMode} className="underline hover:text-brand-ochre" data-testid="switch-mode">
                  {isEvent ? "Voir la commande régulière" : "Demander une soumission pour événement"}
                </button>
              </p>
            )}
          </div>

          <motion.form
            onSubmit={onSubmit}
            data-testid={TID.orderForm}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-7 rounded-3xl border p-6 md:p-8 ${
              isEvent ? "border-white/15 bg-white/5" : "border-brand-line bg-brand-sand"
            }`}
          >
            {/* Event-specific fields */}
            {isEvent && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Type d'événement *" dark={isEvent}>
                  <select required name="event_type" value={eventInfo.event_type} onChange={onChangeEvent} className={isEvent ? "dark-input" : "input"} data-testid="event-type">
                    <option value="">— Choisir —</option>
                    {EVENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Field>
                <Field label="Nombre approximatif de personnes" dark={isEvent}>
                  <input type="number" name="attendees" value={eventInfo.attendees} onChange={onChangeEvent} className={isEvent ? "dark-input" : "input"} placeholder="50" data-testid="event-attendees" />
                </Field>
                <Field label="Date de l'événement" dark={isEvent}>
                  <input type="date" name="event_date" value={eventInfo.event_date} onChange={onChangeEvent} className={isEvent ? "dark-input" : "input"} data-testid="event-date" />
                </Field>
                <Field label="Commentaires ou demandes spéciales" dark={isEvent} className="md:col-span-2">
                  <textarea name="comments" value={eventInfo.comments} onChange={onChangeEvent} rows={2} className={`${isEvent ? "dark-input" : "input"} resize-none`} placeholder="Allergies, horaire, type de service..." data-testid="event-comments" />
                </Field>
              </div>
            )}

            {/* Coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom complet *" dark={isEvent}>
                <input required data-testid={TID.orderName} name="customer_name" value={form.customer_name} onChange={onChange} className={isEvent ? "dark-input" : "input"} placeholder="Aminata D." />
              </Field>
              <Field label="Téléphone *" dark={isEvent}>
                <input required data-testid={TID.orderPhone} name="phone" value={form.phone} onChange={onChange} className={isEvent ? "dark-input" : "input"} placeholder="+1 (438) ..." />
              </Field>
              <Field label="Courriel (recommandé pour confirmation)" dark={isEvent}>
                <input type="email" data-testid={TID.orderEmail} name="email" value={form.email} onChange={onChange} className={isEvent ? "dark-input" : "input"} placeholder="vous@exemple.com" />
              </Field>
              <Field label="Adresse de livraison *" dark={isEvent}>
                <input required data-testid={TID.orderAddress} name="address" value={form.address} onChange={onChange} className={isEvent ? "dark-input" : "input"} placeholder="Quartier, ville, code postal..." />
              </Field>
              <Field label="Mode de paiement préféré" className="md:col-span-2" dark={isEvent}>
                <select data-testid="order-payment-method" name="payment_method" value={form.payment_method} onChange={onChange} className={isEvent ? "dark-input" : "input"}>
                  <option value="">— Choisir —</option>
                  {PAYMENT_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
            </div>

            {/* Items */}
            <div className="mt-6">
              <label className={`text-sm font-medium ${isEvent ? "text-brand-sand" : "text-brand-ink"}`}>Produits sélectionnés</label>
              <div className={`mt-2 rounded-2xl border divide-y ${isEvent ? "border-white/15 bg-white/5 divide-white/10" : "border-brand-line bg-white divide-brand-line"}`}>
                {items.length === 0 && (
                  <div className={`p-4 text-sm ${isEvent ? "text-brand-sand/70" : "text-brand-muted"}`}>
                    Aucun produit sélectionné. Choisissez dans le catalogue ci-dessus ou en cliquant sur les boutons rapides.
                  </div>
                )}
                {items.map((it) => {
                  const key = `${it.product_id}::${it.option_label}`;
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 p-3" data-testid={TID.orderItemRow}>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isEvent ? "text-brand-sand" : "text-brand-ink"}`}>
                          {it.product_name} <span className={isEvent ? "text-brand-sand/60" : "text-brand-muted"}>· {it.option_label}</span>
                        </p>
                        <p className={`text-xs ${isEvent ? "text-brand-sand/60" : "text-brand-muted"}`}>
                          {formatCAD(it.unit_price_cad)} / unité — sous-total {formatCAD(it.unit_price_cad * it.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(key, -1)} className={`h-8 w-8 rounded-full border flex items-center justify-center ${isEvent ? "border-white/20 hover:border-brand-ochre" : "border-brand-line bg-white hover:border-brand-ruby"}`} aria-label="Réduire"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm">{it.quantity}</span>
                        <button type="button" onClick={() => updateQty(key, 1)} className={`h-8 w-8 rounded-full border flex items-center justify-center ${isEvent ? "border-white/20 hover:border-brand-ochre" : "border-brand-line bg-white hover:border-brand-ruby"}`} aria-label="Augmenter"><Plus size={14} /></button>
                        <button type="button" onClick={() => removeItem(key)} className={`h-8 w-8 rounded-full border flex items-center justify-center ${isEvent ? "border-white/20 text-brand-ochre hover:border-brand-ochre" : "border-brand-line bg-white text-brand-ruby hover:border-brand-ruby"}`} aria-label="Supprimer" data-testid={TID.orderItemRemove}><X size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <label className={`text-xs uppercase tracking-[0.18em] ${isEvent ? "text-brand-sand/60" : "text-brand-muted"}`}>Ajouter rapidement</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {products.flatMap((p) =>
                    p.options.map((opt) => (
                      <button
                        key={`${p.id}-${opt.label}`}
                        type="button"
                        onClick={() => addItem(p, opt)}
                        className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
                          isEvent
                            ? "border-white/20 bg-white/5 hover:border-brand-ochre hover:text-brand-ochre"
                            : "border-brand-line bg-white hover:border-brand-ruby hover:text-brand-ruby"
                        }`}
                        data-testid={TID.orderAddItem}
                      >
                        + {p.name} ({opt.label}) — {formatCAD(opt.price_cad)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Field label="Message (optionnel)" className="mt-6" dark={isEvent}>
              <textarea data-testid={TID.orderMessage} name="message" value={form.message} onChange={onChange} rows={3} className={`${isEvent ? "dark-input" : "input"} resize-none`} placeholder="Allergies, horaire préféré, occasion..." />
            </Field>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isEvent ? "text-brand-sand/60" : "text-brand-muted"}`}>
                  {isEvent ? "Estimation produits (frais de livraison ajoutés à la soumission)" : "Sous-total produits"}
                </p>
                <p className={`font-display text-3xl ${isEvent ? "text-brand-ochre" : "text-brand-ink"}`}>{formatCAD(subtotal)}</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                data-testid={TID.orderSubmit}
                className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium disabled:opacity-60 transition-colors ${
                  isEvent
                    ? "bg-brand-ochre text-brand-ink hover:bg-white"
                    : "bg-brand-ruby text-white hover:bg-brand-ink"
                }`}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Envoi…" : isEvent ? "Demander une soumission personnalisée" : "Commander maintenant"}
              </button>
            </div>

            <p className={`mt-5 text-xs ${isEvent ? "text-brand-sand/60" : "text-brand-muted"}`}>
              Une confirmation automatique vous sera envoyée par courriel. Nous vous transmettrons ensuite le montant final et les informations de paiement.
            </p>
          </motion.form>
        </div>
      </div>

      <style>{`
        .input { width: 100%; background: #FFFFFF; border: 1px solid #E8E2D9; border-radius: 14px; padding: 0.75rem 1rem; font-size: 0.925rem; color: #1D1914; outline: none; transition: border-color .2s, box-shadow .2s; }
        .input:focus { border-color: #9A1F38; box-shadow: 0 0 0 4px rgba(154,31,56,0.10); }
        .input::placeholder { color: #A89E8E; }
        .dark-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; padding: 0.75rem 1rem; font-size: 0.925rem; color: #FAF8F5; outline: none; transition: border-color .2s, box-shadow .2s; }
        .dark-input:focus { border-color: #D19627; box-shadow: 0 0 0 4px rgba(209,150,39,0.18); }
        .dark-input::placeholder { color: rgba(250,248,245,0.45); }
        .dark-input option { color: #1D1914; }
      `}</style>
    </section>
  );
}

function Field({ label, children, className = "", dark = false }) {
  return (
    <label className={`block ${className}`}>
      <span className={`text-sm font-medium ${dark ? "text-brand-sand" : "text-brand-ink"}`}>{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
