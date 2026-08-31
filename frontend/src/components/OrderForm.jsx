import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Minus,
  X,
  Loader2,
  ShoppingCart,
  Truck,
  Check,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { TID } from "@/constants/testIds";

const formatCAD = (n) =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);

const emptyForm = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  preferred_delivery_date: "",
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
  { value: "comptant", label: "Comptant à la livraison" },
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

export default function OrderForm({
  preselected,
  onConsume,
  mode = "regular",
}) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [eventInfo, setEventInfo] = useState(emptyEvent);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Nouvelle UX
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileProduct, setMobileProduct] = useState(null);
  const [mobileOption, setMobileOption] = useState(null);
  const [mobileQuantity, setMobileQuantity] = useState(1);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const isEvent = mode === "event";

  /* ================================
     PRODUITS
  ================================= */

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (preselected?.product && preselected?.option) {
      addItem(preselected.product, preselected.option);
      onConsume?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  useEffect(() => {
    const sheetOpen =
      Boolean(mobileProduct) || mobileCartOpen;

    if (!sheetOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileProduct, mobileCartOpen]);

  const groups = useMemo(() => {
    return {
      beignets: products.filter((p) => p.category === "Beignets"),
      boissons: products.filter((p) => p.category === "Boissons"),
      combos: products.filter((p) => p.category === "Combos"),
    };
  }, [products]);

  const catalogueProducts = useMemo(() => {
    switch (activeCategory) {
      case "beignets":
        return groups.beignets;

      case "boissons":
        return groups.boissons;

      case "combos":
        return groups.combos;

      default:
        return products;
    }
  }, [activeCategory, groups, products]);

  /* ================================
     PANIER
  ================================= */

  const addItem = (p, opt, quantityToAdd = 1) => {
    if (!opt) return;

    const key = `${p.id}::${opt.label}`;

    setItems((curr) => {
      const exists = curr.find(
        (it) => `${it.product_id}::${it.option_label}` === key
      );

      if (exists) {
        return curr.map((it) =>
          `${it.product_id}::${it.option_label}` === key
            ? {
              ...it,
              quantity: it.quantity + quantityToAdd,
            }
            : it
        );
      }

      return [
        ...curr,
        {
          product_id: p.id,
          product_name: p.name,
          option_label: opt.label,
          unit_price_cad: opt.price_cad,
          quantity: quantityToAdd,
        },
      ];
    });

    toast.success(`${p.name} ajouté au panier`);
  };

  const openMobileProduct = (product) => {
    setMobileProduct(product);
    setMobileOption(product.options?.[0] || null);
    setMobileQuantity(1);
  };

  const closeMobileProduct = () => {
    setMobileProduct(null);
    setMobileOption(null);
    setMobileQuantity(1);
  };

  const addMobileSelection = () => {
    if (!mobileProduct || !mobileOption) return;

    const quantityToAdd = mobileQuantity;

    for (let i = 0; i < quantityToAdd; i += 1) {
      addItem(mobileProduct, mobileOption, quantityToAdd);
    }

    closeMobileProduct();
  };

  const getProductCartQuantity = (productId) =>
    items
      .filter((item) => item.product_id === productId)
      .reduce((total, item) => total + item.quantity, 0);

  const removeItem = (key) => {
    setItems((curr) =>
      curr.filter(
        (it) => `${it.product_id}::${it.option_label}` !== key
      )
    );
  };

  const updateQty = (key, delta) => {
    setItems((curr) =>
      curr
        .map((it) =>
          `${it.product_id}::${it.option_label}` === key
            ? { ...it, quantity: it.quantity + delta }
            : it
        )
        .filter((it) => it.quantity > 0)
    );
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price_cad * item.quantity,
    0
  );

  /* ================================
     FORMULAIRE
  ================================= */

  const onChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const onChangeEvent = (e) =>
    setEventInfo({
      ...eventInfo,
      [e.target.name]: e.target.value,
    });

  const validateContact = () => {
    if (
      !form.customer_name.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      toast.error(
        "Merci de remplir votre nom, votre téléphone et votre adresse."
      );
      return false;
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      toast.error(
        "Le format du courriel est invalide. Veuillez le corriger ou le laisser vide."
      );
      return false;
    }

    return true;
  };

  const goToDelivery = () => {
    if (!items.length) {
      toast.error("Veuillez ajouter au moins un produit.");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToConfirmation = () => {
    if (!validateContact()) return;

    if (!form.preferred_delivery_date) {
      toast.error(
        "Veuillez sélectionner une date souhaitée pour votre commande."
      );
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================================
     ENVOI BACKEND
     NE PAS MODIFIER LE CONTRAT
  ================================= */

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateContact()) return;

    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un produit.");
      return;
    }

    if (mode === "regular" && !form.preferred_delivery_date) {
      toast.error(
        "Veuillez sélectionner une date souhaitée pour votre commande."
      );
      return;
    }

    if (mode === "event" && !eventInfo.event_type) {
      toast.error("Veuillez préciser le type d'événement.");
      return;
    }

    if (!acceptedTerms) {
      toast.error(
        "Veuillez accepter la Politique de confidentialité et les Conditions générales de vente pour continuer."
      );
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

        preferred_delivery_date:
          mode === "regular"
            ? form.preferred_delivery_date || null
            : null,

        items: items.map(
          ({
            product_id,
            product_name,
            quantity,
            option_label,
            unit_price_cad,
          }) => ({
            product_id,
            product_name,
            quantity,
            option_label,
            unit_price_cad,
          })
        ),
      };

      if (mode === "event") {
        payload.event_info = {
          event_type: eventInfo.event_type,
          attendees: eventInfo.attendees
            ? Number(eventInfo.attendees)
            : null,
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
      setAcceptedTerms(false);
      setStep(1);
    } catch (err) {
      console.error(err);

      toast.error(
        "Impossible d'envoyer votre demande. Réessayez ou écrivez-nous à contact@mikateroyal.com."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================
     SOUMISSION ÉVÉNEMENT
     VERSION TRANSITOIRE PROPRE
  ================================= */

  if (isEvent) {
    return (
      <section className="bg-brand-ink px-6 py-16 text-brand-sand md:px-12 md:py-20">
        <form
          onSubmit={onSubmit}
          noValidate
          className="mx-auto max-w-5xl"
          data-testid={TID.orderForm}
        >
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ochre">
              Événements & groupes
            </p>

            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Une soumission{" "}
              <em className="not-italic text-brand-ochre">
                adaptée à votre événement
              </em>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-sand/70">
              Mariage, anniversaire, baptême, événement corporatif ou
              rassemblement communautaire.
            </p>
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/15 bg-white/5 p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Type d'événement *" dark>
                <select
                  name="event_type"
                  value={eventInfo.event_type}
                  onChange={onChangeEvent}
                  className="dark-input"
                >
                  <option value="">— Choisir —</option>

                  {EVENT_TYPES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Nombre approximatif de personnes" dark>
                <input
                  type="number"
                  name="attendees"
                  value={eventInfo.attendees}
                  onChange={onChangeEvent}
                  className="dark-input"
                  placeholder="50"
                />
              </Field>

              <Field label="Date de l'événement" dark>
                <input
                  type="date"
                  name="event_date"
                  value={eventInfo.event_date}
                  onChange={onChangeEvent}
                  className="dark-input"
                />
              </Field>

              <Field label="Nom complet *" dark>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={onChange}
                  className="dark-input"
                  placeholder="Aminata D."
                />
              </Field>

              <Field label="Téléphone *" dark>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="dark-input"
                  placeholder="+1 (438) ..."
                />
              </Field>

              <Field label="Courriel" dark>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="dark-input"
                  placeholder="vous@exemple.com"
                />
              </Field>

              <Field label="Adresse / lieu de livraison *" dark>
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="dark-input"
                  placeholder="Quartier, ville, code postal..."
                />
              </Field>

              <Field label="Mode de paiement préféré" dark>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={onChange}
                  className="dark-input"
                >
                  <option value="">— Choisir —</option>

                  {PAYMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Commentaires ou demandes spéciales"
                dark
                className="md:col-span-2"
              >
                <textarea
                  name="comments"
                  value={eventInfo.comments}
                  onChange={onChangeEvent}
                  rows={4}
                  className="dark-input resize-none"
                  placeholder="Allergies, horaire, quantités, type de service..."
                />
              </Field>
            </div>

            {/* Produits événement */}
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ochre">
                Produits souhaités
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <OrderProductCard
                    key={p.id}
                    product={p}
                    onAdd={addItem}
                    dark
                  />
                ))}
              </div>
            </div>

            <div className="mt-10">
              <CartSummary
                items={items}
                subtotal={subtotal}
                updateQty={updateQty}
                removeItem={removeItem}
                dark
              />
            </div>

            <Consent
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              dark
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-ochre px-7 py-4 text-sm font-semibold text-brand-ink transition hover:bg-white disabled:opacity-50"
            >
              {submitting && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {submitting
                ? "Envoi…"
                : "Demander ma soumission"}
            </button>
          </div>
        </form>

        <InputStyles />
      </section>
    );
  }

  /* ================================
     COMMANDE RÉGULIÈRE
  ================================= */

  return (
    <section className="bg-[#faf8f5] px-6 pb-24 md:px-12">
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto max-w-7xl"
        data-testid={TID.orderForm}
      >
        <StepProgress step={step} />

        <AnimatePresence mode="wait">
          {/* ============================================
              ÉTAPE 1 — PRODUITS + PANIER
          ============================================= */}
          {step === 1 && (
            <motion.div
              key="step-products"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ruby">
                  Étape 1
                </p>

                <h2 className="mt-3 font-display text-4xl text-brand-ink md:text-5xl">
                  Composez votre commande
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-muted">
                  Choisissez vos produits, le format souhaité et ajoutez-les
                  à votre panier.
                </p>
              </div>

              {/* Tabs */}
              <div className="mt-9 overflow-x-auto">
                <div className="mx-auto flex w-max gap-1 rounded-full border border-brand-line bg-white p-1.5">
                  <CategoryTab
                    active={activeCategory === "all"}
                    onClick={() => setActiveCategory("all")}
                  >
                    Tous ({products.length})
                  </CategoryTab>

                  <CategoryTab
                    active={activeCategory === "beignets"}
                    onClick={() => setActiveCategory("beignets")}
                  >
                    Mikatés ({groups.beignets.length})
                  </CategoryTab>

                  <CategoryTab
                    active={activeCategory === "boissons"}
                    onClick={() => setActiveCategory("boissons")}
                  >
                    Boissons ({groups.boissons.length})
                  </CategoryTab>

                  <CategoryTab
                    active={activeCategory === "combos"}
                    onClick={() => setActiveCategory("combos")}
                  >
                    Combos ({groups.combos.length})
                  </CategoryTab>
                </div>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                {/* Catalogue */}
                <div>
                  {/* =========================================
                          MOBILE — LISTE COMPACTE
                      ========================================== */}
                  <div className="md:hidden">
                    <div className="divide-y divide-brand-line">
                      {catalogueProducts.map((product) => (
                        <MobileProductRow
                          key={product.id}
                          product={product}
                          cartQuantity={getProductCartQuantity(product.id)}
                          onOpen={() => openMobileProduct(product)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* =========================================
      DESKTOP — CARTES PREMIUM ACTUELLES
  ========================================== */}
                  <div className="hidden gap-6 md:grid md:grid-cols-2">
                    {catalogueProducts.map((product) => (
                      <OrderProductCard
                        key={product.id}
                        product={product}
                        onAdd={addItem}
                      />
                    ))}
                  </div>
                </div>

                {/* Panier */}
                <aside className="hidden md:block md:self-start lg:sticky lg:top-28">
                  <CartSummary
                    items={items}
                    subtotal={subtotal}
                    updateQty={updateQty}
                    removeItem={removeItem}
                  />

                  <button
                    type="button"
                    disabled={!items.length}
                    onClick={goToDelivery}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-ruby px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continuer vers la livraison
                    <Truck size={16} />
                  </button>
                </aside>
              </div>
            </motion.div>
          )}

          {/* ============================================
              ÉTAPE 2 — LIVRAISON
          ============================================= */}
          {step === 2 && (
            <motion.div
              key="step-delivery"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-3xl"
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ruby">
                  Étape 2
                </p>

                <h2 className="mt-3 font-display text-4xl text-brand-ink md:text-5xl">
                  Livraison & coordonnées
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-brand-muted">
                  Indiquez-nous où et quand vous souhaitez recevoir votre
                  commande.
                </p>
              </div>

              <div className="mt-10 rounded-[2rem] border border-brand-line bg-white p-6 md:p-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nom complet *">
                    <input
                      data-testid={TID.orderName}
                      name="customer_name"
                      value={form.customer_name}
                      onChange={onChange}
                      className="input"
                      placeholder="Aminata D."
                    />
                  </Field>

                  <Field label="Téléphone *">
                    <input
                      data-testid={TID.orderPhone}
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="input"
                      placeholder="+1 (438) ..."
                    />
                  </Field>

                  <Field label="Courriel">
                    <input
                      type="email"
                      data-testid={TID.orderEmail}
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      className="input"
                      placeholder="vous@exemple.com"
                    />
                  </Field>

                  <Field label="Date souhaitée *">
                    <input
                      type="date"
                      name="preferred_delivery_date"
                      value={form.preferred_delivery_date}
                      onChange={onChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="input"
                      data-testid="order-preferred-date"
                    />
                  </Field>

                  <Field
                    label="Adresse de livraison *"
                    className="md:col-span-2"
                  >
                    <input
                      data-testid={TID.orderAddress}
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      className="input"
                      placeholder="Quartier, ville, code postal..."
                    />
                  </Field>

                  <Field
                    label="Mode de paiement préféré"
                    className="md:col-span-2"
                  >
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={onChange}
                      className="input"
                    >
                      <option value="">— Choisir —</option>

                      {PAYMENT_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Instructions ou allergies (optionnel)"
                    className="md:col-span-2"
                  >
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={4}
                      className="input resize-none"
                      placeholder="Allergies, horaire préféré, instructions..."
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-medium text-brand-ink"
                >
                  ← Retour au panier
                </button>

                <button
                  type="button"
                  onClick={goToConfirmation}
                  className="rounded-full bg-brand-ruby px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink"
                >
                  Vérifier ma commande →
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================
              ÉTAPE 3 — CONFIRMATION
          ============================================= */}
          {step === 3 && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-3xl"
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ruby">
                  Étape 3
                </p>

                <h2 className="mt-3 font-display text-4xl text-brand-ink md:text-5xl">
                  Vérifiez votre commande
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-brand-muted">
                  Une dernière vérification avant l'envoi.
                </p>
              </div>

              <div className="mt-10 overflow-hidden rounded-[2rem] border border-brand-line bg-white">
                {/* Livraison */}
                <div className="border-b border-brand-line p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ruby">
                    Livraison
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-brand-ink">
                    <p className="font-semibold">
                      {form.customer_name}
                    </p>

                    <p>{form.phone}</p>

                    {form.email && <p>{form.email}</p>}

                    <p>{form.address}</p>

                    <p>
                      Date souhaitée :{" "}
                      {form.preferred_delivery_date}
                    </p>
                  </div>
                </div>

                {/* Produits */}
                <div className="p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ruby">
                    Votre commande
                  </p>

                  <div className="mt-4 divide-y divide-brand-line">
                    {items.map((it) => (
                      <div
                        key={`${it.product_id}-${it.option_label}`}
                        className="flex justify-between gap-4 py-4"
                      >
                        <div>
                          <p className="font-semibold text-brand-ink">
                            {it.product_name}
                          </p>

                          <p className="mt-1 text-sm text-brand-muted">
                            {it.option_label} × {it.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-brand-ruby">
                          {formatCAD(
                            it.unit_price_cad * it.quantity
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-brand-line pt-5">
                    <span className="text-brand-muted">
                      Sous-total produits
                    </span>

                    <span className="font-display text-3xl text-brand-ink">
                      {formatCAD(subtotal)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-brand-muted">
                    Les frais de livraison et le montant final seront
                    confirmés par notre équipe.
                  </p>
                </div>
              </div>

              <AllergenNotice />

              <Consent
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
              />

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-medium text-brand-ink"
                >
                  ← Modifier mes informations
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  data-testid={TID.orderSubmit}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand-ruby px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-ink disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {submitting
                    ? "Envoi…"
                    : "Confirmer ma commande"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* =========================================
          MOBILE — FICHE PRODUIT
      ========================================== */}
      <AnimatePresence>
        {mobileProduct && (
          <MobileProductSheet
            product={mobileProduct}
            selectedOption={mobileOption}
            setSelectedOption={setMobileOption}
            quantity={mobileQuantity}
            setQuantity={setMobileQuantity}
            onClose={closeMobileProduct}
            onAdd={addMobileSelection}
          />
        )}
      </AnimatePresence>

      {/* =========================================
          MOBILE — BARRE PANIER STICKY
      ========================================== */}
      {step === 1 &&
        items.length > 0 &&
        !mobileProduct &&
        !mobileCartOpen && (
          <MobileCartBar
            items={items}
            subtotal={subtotal}
            onOpen={() => setMobileCartOpen(true)}
          />
        )}

      {/* =========================================
          MOBILE — PANIER BOTTOM SHEET
      ========================================== */}
      <AnimatePresence>
        {mobileCartOpen && (
          <MobileCartSheet
            items={items}
            subtotal={subtotal}
            updateQty={updateQty}
            removeItem={removeItem}
            onClose={() => setMobileCartOpen(false)}
            onContinue={() => {
              setMobileCartOpen(false);
              goToDelivery();
            }}
          />
        )}
      </AnimatePresence>

      <InputStyles />
    </section>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function StepProgress({ step }) {
  const steps = [
    { number: 1, label: "Mon panier", icon: ShoppingCart },
    { number: 2, label: "Livraison", icon: Truck },
    { number: 3, label: "Confirmation", icon: Check },
  ];

  return (
    <div className="mx-auto mb-14 max-w-2xl pt-6">
      <div className="grid grid-cols-3">
        {steps.map(({ number, label, icon: Icon }, index) => {
          const active = step === number;
          const completed = step > number;

          return (
            <div key={number} className="relative text-center">
              {index !== 0 && (
                <div
                  className={`absolute right-1/2 top-[18px] h-px w-full ${step >= number
                    ? "bg-brand-ochre"
                    : "bg-brand-line"
                    }`}
                />
              )}

              <div
                className={`relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full ${active
                  ? "bg-brand-ruby text-white"
                  : completed
                    ? "bg-brand-ochre text-brand-ink"
                    : "border border-brand-line bg-white text-brand-muted"
                  }`}
              >
                {completed ? (
                  <Check size={15} />
                ) : (
                  <Icon size={15} />
                )}
              </div>

              <p
                className={`mt-2 text-xs ${active
                  ? "font-semibold text-brand-ink"
                  : "text-brand-muted"
                  }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-medium transition-all sm:px-5 sm:text-sm ${active
        ? "bg-brand-ink text-white shadow-sm"
        : "text-brand-muted hover:bg-brand-sand hover:text-brand-ink"
        }`}
    >
      {children}
    </button>
  );
}
function MobileProductRow({
  product: p,
  cartQuantity = 0,
  onOpen,
}) {
  const startingPrice =
    p.options?.length > 0
      ? Math.min(...p.options.map((opt) => opt.price_cad))
      : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        group
        flex
        w-full
        items-center
        gap-4
        py-5
        text-left
        transition-colors
        active:bg-brand-sand/70
      "
    >
      {/* TEXTE */}
      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.35rem] leading-tight text-brand-ink">
          {p.name}
        </p>

        <p className="mt-1.5 text-sm font-semibold text-brand-ruby">
          {p.options?.length > 1
            ? `À partir de ${formatCAD(startingPrice)}`
            : formatCAD(startingPrice)}
        </p>

        {/* Description volontairement courte ici */}
        <p className="mt-1.5 line-clamp-1 text-sm leading-relaxed text-brand-muted">
          {p.description}
        </p>
      </div>

      {/* IMAGE */}
      <div className="relative h-24 w-24 shrink-0">
        <img
          src={p.image_url}
          alt={p.name}
          loading="lazy"
          className="h-full w-full rounded-2xl object-cover"
        />

        {/* + ou compteur */}
        <span
          className={`
            absolute
            -bottom-2
            -right-2
            flex
            h-10
            min-w-10
            items-center
            justify-center
            rounded-full
            border-2
            border-white
            px-2
            text-sm
            font-bold
            shadow-lg
            ${cartQuantity > 0
              ? "bg-brand-ink text-brand-ochre"
              : "bg-white text-brand-ink"
            }
          `}
        >
          {cartQuantity > 0 ? (
            cartQuantity
          ) : (
            <Plus size={19} />
          )}
        </span>
      </div>
    </button>
  );
}

function MobileProductSheet({
  product: p,
  selectedOption,
  setSelectedOption,
  quantity,
  setQuantity,
  onClose,
  onAdd,
}) {
  if (!p || !selectedOption) return null;

  const total = selectedOption.price_cad * quantity;

  return (
    <>
      {/* BACKDROP */}
      <motion.button
        type="button"
        aria-label="Fermer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[2px] md:hidden"
      />

      {/* BOTTOM SHEET */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 280,
        }}
        className="
          fixed
          inset-x-0
          bottom-0
          z-[100]
          max-h-[92dvh]
          overflow-hidden
          rounded-t-[2rem]
          bg-[#faf8f5]
          shadow-[0_-20px_80px_rgba(0,0,0,0.3)]
          md:hidden
        "
      >
        {/* CONTENU SCROLLABLE */}
        <div className="max-h-[92dvh] overflow-y-auto pb-28">

          {/* HANDLE */}
          <div className="sticky top-0 z-20 flex justify-center bg-[#faf8f5]/95 py-3 backdrop-blur">
            <div className="h-1.5 w-12 rounded-full bg-brand-line" />
          </div>

          {/* IMAGE HERO */}
          <div className="relative px-5">
            <div className="h-[260px] overflow-hidden rounded-[1.75rem]">
              <img
                src={p.image_url}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="
                absolute
                right-8
                top-4
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white
                text-brand-ink
                shadow-lg
              "
            >
              <X size={19} />
            </button>
          </div>

          {/* PRODUIT */}
          <div className="px-6 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-ruby">
              {p.category}
            </p>

            <h3 className="mt-2 font-display text-3xl leading-tight text-brand-ink">
              {p.name}
            </h3>

            {/* DESCRIPTION COMPLÈTE ICI */}
            <p className="mt-4 text-sm leading-7 text-brand-muted">
              {p.description}
            </p>

            {/* FORMAT */}
            <div className="mt-8 border-t border-brand-line pt-6">
              <div className="flex items-end justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-brand-ink">
                    Choisir le format
                  </h4>

                  <p className="mt-1 text-sm text-brand-muted">
                    Sélectionnez une option
                  </p>
                </div>

                <span className="rounded-lg bg-brand-sand px-2.5 py-1 text-xs font-semibold text-brand-muted">
                  Obligatoire
                </span>
              </div>

              <div className="mt-5 divide-y divide-brand-line">
                {p.options.map((opt) => {
                  const selected =
                    selectedOption?.label === opt.label;

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        setSelectedOption(opt)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                        py-5
                        text-left
                      "
                    >
                      <div>
                        <p className="font-medium text-brand-ink">
                          {opt.label}
                        </p>

                        <p className="mt-1 text-sm text-brand-muted">
                          {formatCAD(opt.price_cad)}
                        </p>
                      </div>

                      {/* RADIO */}
                      <span
                        className={`
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          ${selected
                            ? "border-brand-ruby"
                            : "border-brand-line"
                          }
                        `}
                      >
                        {selected && (
                          <span className="h-3 w-3 rounded-full bg-brand-ruby" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITÉ */}
            <div className="mt-3 border-t border-brand-line py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-brand-ink">
                    Quantité
                  </h4>

                  <p className="mt-1 text-sm text-brand-muted">
                    Nombre de lots
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-full border border-brand-line bg-white p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(1, q - 1)
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink active:bg-brand-sand"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="min-w-6 text-center text-base font-semibold text-brand-ink">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => q + 1)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink text-white"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA STICKY */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            border-t
            border-brand-line
            bg-[#faf8f5]/95
            px-5
            pb-[max(1.25rem,env(safe-area-inset-bottom))]
            pt-4
            backdrop-blur-xl
          "
        >
          <button
            type="button"
            onClick={onAdd}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-brand-ink
              px-6
              py-4
              text-base
              font-semibold
              text-white
              shadow-lg
              active:scale-[0.99]
            "
          >
            Ajouter {quantity} au panier
            <span className="text-white/50">•</span>
            {formatCAD(total)}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function MobileCartBar({
  items,
  subtotal,
  onOpen,
}) {
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-[70]
        border-t
        border-brand-line
        bg-[#faf8f5]/95
        px-4
        pb-[max(1rem,env(safe-area-inset-bottom))]
        pt-3
        backdrop-blur-xl
        md:hidden
      "
    >
      <button
        type="button"
        onClick={onOpen}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-2xl
          bg-brand-ink
          px-5
          py-4
          text-white
          shadow-xl
          active:scale-[0.99]
        "
      >
        <div className="flex items-center gap-3">
          <ShoppingCart size={18} />

          <span className="text-sm font-medium">
            {totalQuantity}{" "}
            {totalQuantity > 1
              ? "articles"
              : "article"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">
            {formatCAD(subtotal)}
          </span>

          <span className="text-sm text-brand-ochre">
            Voir panier
          </span>
        </div>
      </button>
    </div>
  );
}

function MobileCartSheet({
  items,
  subtotal,
  updateQty,
  removeItem,
  onClose,
  onContinue,
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.button
        type="button"
        aria-label="Fermer le panier"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="
          fixed
          inset-0
          z-[90]
          bg-black/55
          backdrop-blur-[2px]
          md:hidden
        "
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 280,
        }}
        className="
          fixed
          inset-x-0
          bottom-0
          z-[100]
          max-h-[88dvh]
          overflow-hidden
          rounded-t-[2rem]
          bg-[#faf8f5]
          shadow-[0_-20px_80px_rgba(0,0,0,0.3)]
          md:hidden
        "
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-brand-line" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-ruby">
              Mon panier
            </p>

            <h3 className="mt-1 font-display text-3xl text-brand-ink">
              Votre sélection
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-brand-line
              bg-white
              text-brand-ink
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Liste */}
        <div
          className="
            max-h-[52dvh]
            overflow-y-auto
            divide-y
            divide-brand-line
            px-5
          "
        >
          {items.map((it) => {
            const key =
              `${it.product_id}::${it.option_label}`;

            return (
              <div
                key={key}
                className="py-5"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-ink">
                      {it.product_name}
                    </p>

                    <p className="mt-1 text-sm text-brand-muted">
                      {it.option_label}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-brand-ruby">
                    {formatCAD(
                      it.unit_price_cad *
                      it.quantity
                    )}
                  </p>
                </div>

                {/* Quantité */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(key, -1)
                    }
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-brand-line
                      bg-white
                      text-brand-ink
                    "
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-7 text-center font-semibold text-brand-ink">
                    {it.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQty(key, 1)
                    }
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-brand-ink
                      text-white
                    "
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(key)
                    }
                    className="
                      ml-auto
                      flex
                      items-center
                      gap-1
                      text-sm
                      font-medium
                      text-brand-ruby
                    "
                  >
                    <X size={15} />
                    Retirer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="
            border-t
            border-brand-line
            bg-[#faf8f5]/95
            px-5
            pb-[max(1.25rem,env(safe-area-inset-bottom))]
            pt-5
            backdrop-blur-xl
          "
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-brand-muted">
                Sous-total
              </p>

              <p className="mt-1 text-xs text-brand-muted">
                Livraison à confirmer
              </p>
            </div>

            <span className="font-display text-3xl text-brand-ink">
              {formatCAD(subtotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-brand-ruby
              px-6
              py-4
              text-base
              font-semibold
              text-white
              shadow-lg
              active:scale-[0.99]
            "
          >
            Continuer vers la livraison
            <Truck size={17} />
          </button>
        </div>
      </motion.div>
    </>
  );
}


function OrderProductCard({ product: p, onAdd, dark = false }) {
  const [selectedOption, setSelectedOption] = useState(
    p.options?.[0] || null
  );

  if (!selectedOption) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`overflow-hidden rounded-[1.75rem] border p-4 ${dark
        ? "border-white/15 bg-white/5"
        : "border-brand-line bg-white"
        }`}
    >
      <div className="arch-top h-56 overflow-hidden bg-brand-sand">
        <img
          src={p.image_url}
          alt={p.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="px-1 pb-2 pt-5">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${dark ? "text-brand-ochre" : "text-brand-ruby"
            }`}
        >
          {p.category}
        </p>

        <h3
          className={`mt-2 font-display text-2xl ${dark ? "text-white" : "text-brand-ink"
            }`}
        >
          {p.name}
        </h3>

        <p
          className={`mt-2 text-sm leading-relaxed ${dark ? "text-brand-sand/65" : "text-brand-muted"
            }`}
        >
          {p.description}
        </p>

        <p
          className={`mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-brand-sand/60" : "text-brand-muted"
            }`}
        >
          Choisir le format
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {p.options.map((opt) => {
            const selected =
              selectedOption.label === opt.label;

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={`rounded-full border px-3 py-2 text-xs transition ${selected
                  ? dark
                    ? "border-brand-ochre bg-brand-ochre text-brand-ink"
                    : "border-brand-ruby bg-brand-ruby text-white"
                  : dark
                    ? "border-white/20 text-brand-sand"
                    : "border-brand-line text-brand-ink hover:border-brand-ruby"
                  }`}
              >
                {opt.label} · {formatCAD(opt.price_cad)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onAdd(p, selectedOption)}
          data-testid={TID.orderAddItem}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${dark
            ? "bg-brand-ochre text-brand-ink hover:bg-white"
            : "bg-brand-ink text-white hover:bg-brand-ruby"
            }`}
        >
          <Plus size={15} />
          Ajouter au panier
        </button>
      </div>
    </motion.article>
  );
}

function CartSummary({
  items,
  subtotal,
  updateQty,
  removeItem,
  dark = false,
}) {
  return (
    <div
      className={`rounded-[1.75rem] border p-5 ${dark
        ? "border-white/15 bg-white/5"
        : "border-brand-line bg-white shadow-sm"
        }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-brand-ochre" : "text-brand-ruby"
          }`}
      >
        Mon panier
      </p>

      <h3
        className={`mt-2 font-display text-2xl ${dark ? "text-white" : "text-brand-ink"
          }`}
      >
        Votre sélection
      </h3>

      {!items.length ? (
        <div
          className={`mt-6 rounded-2xl p-5 text-sm ${dark
            ? "bg-white/5 text-brand-sand/60"
            : "bg-brand-sand text-brand-muted"
            }`}
        >
          Votre panier est vide.
        </div>
      ) : (
        <div
          className={`mt-5 divide-y ${dark ? "divide-white/10" : "divide-brand-line"
            }`}
        >
          {items.map((it) => {
            const key = `${it.product_id}::${it.option_label}`;

            return (
              <div
                key={key}
                className="py-4"
                data-testid={TID.orderItemRow}
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm font-semibold ${dark ? "text-white" : "text-brand-ink"
                        }`}
                    >
                      {it.product_name}
                    </p>

                    <p
                      className={`mt-1 text-xs ${dark
                        ? "text-brand-sand/60"
                        : "text-brand-muted"
                        }`}
                    >
                      {it.option_label}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${dark
                      ? "text-brand-ochre"
                      : "text-brand-ruby"
                      }`}
                  >
                    {formatCAD(
                      it.unit_price_cad * it.quantity
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(key, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-current/20"
                  >
                    <Minus size={13} />
                  </button>

                  <span className="w-6 text-center text-sm">
                    {it.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQty(key, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-current/20"
                  >
                    <Plus size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(key)}
                    data-testid={TID.orderItemRemove}
                    className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full ${dark
                      ? "text-brand-ochre"
                      : "text-brand-ruby"
                      }`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        className={`mt-5 flex items-end justify-between border-t pt-5 ${dark ? "border-white/10" : "border-brand-line"
          }`}
      >
        <span
          className={`text-sm ${dark
            ? "text-brand-sand/60"
            : "text-brand-muted"
            }`}
        >
          Sous-total
        </span>

        <span
          className={`font-display text-3xl ${dark ? "text-brand-ochre" : "text-brand-ink"
            }`}
        >
          {formatCAD(subtotal)}
        </span>
      </div>
    </div>
  );
}

function AllergenNotice() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-ochre/20 border-l-4 border-l-brand-ochre bg-brand-ochre/10 p-4">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-ochre text-xs font-bold text-white">
        !
      </span>

      <p className="text-sm leading-relaxed text-brand-ink">
        <strong>Avis allergènes : </strong>
        Nos produits peuvent contenir ou avoir été en contact avec des
        allergènes tels que les arachides, le gluten, les œufs ou le lait.
        Veuillez nous informer de toute allergie avant de commander.
      </p>
    </div>
  );
}

function Consent({
  acceptedTerms,
  setAcceptedTerms,
  dark = false,
}) {
  return (
    <label
      className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${dark
        ? "border-white/15 bg-white/5"
        : "border-brand-line bg-white"
        }`}
    >
      <input
        type="checkbox"
        checked={acceptedTerms}
        onChange={(e) => setAcceptedTerms(e.target.checked)}
        data-testid="order-consent-checkbox"
        className="mt-1 h-4 w-4 accent-brand-ruby"
      />

      <span
        className={`text-sm leading-relaxed ${dark ? "text-brand-sand/90" : "text-brand-ink"
          }`}
      >
        J&apos;ai lu et j&apos;accepte la{" "}
        <Link
          to="/politique-confidentialite"
          target="_blank"
          className="underline"
        >
          Politique de confidentialité
        </Link>{" "}
        ainsi que les{" "}
        <Link
          to="/conditions-generales-vente"
          target="_blank"
          className="underline"
        >
          Conditions générales de vente
        </Link>
        .
      </span>
    </label>
  );
}

function Field({
  label,
  children,
  className = "",
  dark = false,
}) {
  return (
    <label className={`block ${className}`}>
      <span
        className={`text-sm font-medium ${dark ? "text-brand-sand" : "text-brand-ink"
          }`}
      >
        {label}
      </span>

      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function InputStyles() {
  return (
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

      .input:focus {
        border-color: #9A1F38;
        box-shadow: 0 0 0 4px rgba(154,31,56,0.10);
      }

      .input::placeholder {
        color: #A89E8E;
      }

      .dark-input {
        width: 100%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 14px;
        padding: 0.75rem 1rem;
        font-size: 0.925rem;
        color: #FAF8F5;
        outline: none;
      }

      .dark-input:focus {
        border-color: #D19627;
        box-shadow: 0 0 0 4px rgba(209,150,39,0.18);
      }

      .dark-input::placeholder {
        color: rgba(250,248,245,0.45);
      }

      .dark-input option {
        color: #1D1914;
      }
    `}</style>
  );
}